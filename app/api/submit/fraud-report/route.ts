import { NextRequest, NextResponse } from "next/server"
import { validateFraudReport } from "@/lib/utils/validation"
import { rateLimiter } from "@/lib/security/rate-limiter"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
}

const WEB3FORMS_API_KEY = process.env.WEB3FORMS_API_KEY
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

interface FormDataFields {
  fullName?: string
  contactEmail?: string
  contactPhone?: string
  scamType?: string
  amount?: string
  currency?: string
  timeline?: string
  description?: string
  transactionHashes?: string
  bankReferences?: string
}

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    if (!WEB3FORMS_API_KEY) {
      console.error("[Fraud Report API] Missing WEB3FORMS_API_KEY environment variable")
      return NextResponse.json(
        { success: false, message: "Server configuration error. Please try again later." },
        { status: 500 }
      )
    }

    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Apply rate limiting
    if (!rateLimiter.isAllowed(clientIp, RATE_LIMIT_CONFIG)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const contentType = request.headers.get("content-type") || ""
    let fullName = ""
    let contactEmail = ""
    let contactPhone = ""
    let scamType = ""
    let amount = ""
    let currency = ""
    let timeline = ""
    let description = ""
    let transactionHashes: string[] = []
    let bankReferences: string[] = []
    const uploadedFiles: { name: string; size: number }[] = []

    // Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      fullName = (formData.get("fullName") as string) || ""
      contactEmail = (formData.get("contactEmail") as string) || ""
      contactPhone = (formData.get("contactPhone") as string) || ""
      scamType = (formData.get("scamType") as string) || ""
      amount = (formData.get("amount") as string) || ""
      currency = (formData.get("currency") as string) || ""
      timeline = (formData.get("timeline") as string) || ""
      description = (formData.get("description") as string) || ""

      const txHashesStr = (formData.get("transactionHashes") as string) || ""
      const bankRefsStr = (formData.get("bankReferences") as string) || ""

      try {
        transactionHashes = txHashesStr ? JSON.parse(txHashesStr) : []
        bankReferences = bankRefsStr ? JSON.parse(bankRefsStr) : []
      } catch {
        transactionHashes = []
        bankReferences = []
      }

      // Process file uploads
      const files = formData.getAll("files")
      for (const file of files) {
        if (file instanceof File) {
          uploadedFiles.push({ name: file.name, size: file.size })
        }
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid content type. Expected multipart/form-data." },
        { status: 400 }
      )
    }

    // Validate required fields server-side
    const validation = validateFraudReport({
      fullName,
      contactEmail,
      scamType,
      amount,
      currency,
      timeline,
      description,
      transactionHashes,
      bankReferences,
    })

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      )
    }

    // Create Web3Forms submission
    const web3formsData = new FormData()
    web3formsData.append("access_key", WEB3FORMS_API_KEY)
    web3formsData.append("form_name", "fraud-report")
    web3formsData.append("fullName", fullName)
    web3formsData.append("contactEmail", contactEmail)
    web3formsData.append("contactPhone", contactPhone)
    web3formsData.append("scamType", scamType)
    web3formsData.append("amount", amount)
    web3formsData.append("currency", currency)
    web3formsData.append("timeline", timeline)
    web3formsData.append("description", description)
    web3formsData.append("transactionHashes", JSON.stringify(transactionHashes))
    web3formsData.append("bankReferences", JSON.stringify(bankReferences))
    web3formsData.append("filesCount", uploadedFiles.length.toString())
    web3formsData.append("fileNames", uploadedFiles.map((f) => f.name).join(", "))
    web3formsData.append("clientIp", clientIp)
    web3formsData.append("userAgent", request.headers.get("user-agent") || "unknown")
    web3formsData.append("submittedAt", new Date().toISOString())

    // Submit to Web3Forms
    const web3formsResponse = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      body: web3formsData,
    })

    const web3formsResult = await web3formsResponse.json()

    if (!web3formsResult.success) {
      console.error("[Fraud Report API] Web3Forms submission failed:", web3formsResult)
      return NextResponse.json(
        { success: false, message: web3formsResult.message || "Submission failed. Please try again." },
        { status: 400 }
      )
    }

    // Generate local case ID for user reference
    const caseId = `CSRU-${Date.now().toString(36).toUpperCase()}`

    console.log(`[Fraud Report API] Successful submission - Case: ${caseId}, Email: ${contactEmail}`)

    return NextResponse.json(
      {
        success: true,
        caseId,
        message: "Fraud report received successfully. We will review your case shortly.",
        filesProcessed: uploadedFiles.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Fraud Report API] Error:", error)
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    )
  }
}
