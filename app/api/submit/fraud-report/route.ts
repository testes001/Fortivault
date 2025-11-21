import { NextRequest, NextResponse } from "next/server"
import { validateFraudReport } from "@/lib/utils/validation"
import { rateLimiter } from "@/lib/security/rate-limiter"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
}

const WEB3FORMS_API_KEY = process.env.WEB3FORMS_API_KEY
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

export const runtime = "nodejs"

async function extractFormData(request: NextRequest) {
  const contentType = request.headers.get("content-type") || ""

  if (!contentType.includes("multipart/form-data")) {
    return {
      error: "Invalid content type. Expected multipart/form-data.",
      data: null,
    }
  }

  try {
    const formData = await request.formData()

    const fullName = (formData.get("fullName") as string) || ""
    const contactEmail = (formData.get("contactEmail") as string) || ""
    const contactPhone = (formData.get("contactPhone") as string) || ""
    const scamType = (formData.get("scamType") as string) || ""
    const amount = (formData.get("amount") as string) || ""
    const currency = (formData.get("currency") as string) || ""
    const timeline = (formData.get("timeline") as string) || ""
    const description = (formData.get("description") as string) || ""

    let transactionHashes: string[] = []
    let bankReferences: string[] = []

    try {
      const txHashesStr = (formData.get("transactionHashes") as string) || ""
      const bankRefsStr = (formData.get("bankReferences") as string) || ""
      transactionHashes = txHashesStr ? JSON.parse(txHashesStr) : []
      bankReferences = bankRefsStr ? JSON.parse(bankRefsStr) : []
    } catch {
      transactionHashes = []
      bankReferences = []
    }

    const uploadedFiles: { name: string; size: number }[] = []
    const files = formData.getAll("files")
    for (const file of files) {
      if (file instanceof File) {
        uploadedFiles.push({ name: file.name, size: file.size })
      }
    }

    return {
      error: null,
      data: {
        fullName,
        contactEmail,
        contactPhone,
        scamType,
        amount,
        currency,
        timeline,
        description,
        transactionHashes,
        bankReferences,
        uploadedFiles,
      },
    }
  } catch (error) {
    console.error("[Fraud Report API] Error reading form data:", error)
    return {
      error: "Failed to process form data. Please try again.",
      data: null,
    }
  }
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    if (!WEB3FORMS_API_KEY) {
      console.error("[Fraud Report API] Missing WEB3FORMS_API_KEY environment variable")
      return NextResponse.json(
        { success: false, message: "Server configuration error. Please try again later." },
        { status: 500 }
      )
    }

    if (!rateLimiter.isAllowed(clientIp, RATE_LIMIT_CONFIG)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const { error: extractError, data } = await extractFormData(request)

    if (extractError || !data) {
      return NextResponse.json(
        { success: false, message: extractError || "Invalid request data" },
        { status: 400 }
      )
    }

    const {
      fullName,
      contactEmail,
      contactPhone,
      scamType,
      amount,
      currency,
      timeline,
      description,
      transactionHashes,
      bankReferences,
      uploadedFiles,
    } = data

    console.log("[Fraud Report API] Received submission:", {
      fullName,
      contactEmail,
      scamType,
      amount,
      currency,
    })

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
      console.error("[Fraud Report API] Validation failed:", validation.errors)
      return NextResponse.json(
        { success: false, errors: validation.errors, message: validation.errors[0] },
        { status: 400 }
      )
    }

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

    let web3formsResponse: Response
    try {
      web3formsResponse = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: web3formsData,
      })
    } catch (error) {
      console.error("[Fraud Report API] Error contacting Web3Forms:", error)
      return NextResponse.json(
        { success: false, message: "Unable to submit form. Please try again later." },
        { status: 500 }
      )
    }

    if (!web3formsResponse.ok) {
      console.error(`[Fraud Report API] Web3Forms returned ${web3formsResponse.status}`)
      return NextResponse.json(
        { success: false, message: "Submission service unavailable. Please try again later." },
        { status: 500 }
      )
    }

    let web3formsResult: any
    try {
      web3formsResult = await web3formsResponse.json()
    } catch (error) {
      console.error("[Fraud Report API] Error parsing Web3Forms response:", error)
      return NextResponse.json(
        { success: false, message: "Invalid response from submission service." },
        { status: 500 }
      )
    }

    if (!web3formsResult.success) {
      console.error("[Fraud Report API] Web3Forms submission failed:", web3formsResult)
      return NextResponse.json(
        { success: false, message: web3formsResult.message || "Submission failed. Please try again." },
        { status: 400 }
      )
    }

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
    console.error("[Fraud Report API] Unexpected error:", error)
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, message: `Internal server error: ${errorMsg}` },
      { status: 500 }
    )
  }
}
