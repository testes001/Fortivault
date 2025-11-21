import { NextRequest, NextResponse } from "next/server"
import { generateCaseId } from "@/lib/utils/case-id-generator"
import { validateFraudReport, validateFileSize, validateFileType } from "@/lib/utils/validation"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { logSubmission } from "@/lib/submission-logger"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE_MB = 10
const MAX_TOTAL_SIZE_MB = 50

export const runtime = "nodejs"

interface FormDataFields {
  fullName?: string | string[]
  contactEmail?: string | string[]
  contactPhone?: string | string[]
  scamType?: string | string[]
  amount?: string | string[]
  currency?: string | string[]
  timeline?: string | string[]
  description?: string | string[]
  transactionHashes?: string | string[]
  bankReferences?: string | string[]
}

function getFormValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ""
  return value || ""
}

function parseJSONArray(value: string): string[] {
  try {
    if (!value) return []
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Apply rate limiting
    if (!rateLimiter.isAllowed(clientIp, RATE_LIMIT_CONFIG)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
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
    let uploadedFiles: { name: string; size: number }[] = []
    let totalFileSize = 0

    // Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      fullName = getFormValue(formData.get("fullName") as string | string[] | null)
      contactEmail = getFormValue(formData.get("contactEmail") as string | string[] | null)
      contactPhone = getFormValue(formData.get("contactPhone") as string | string[] | null)
      scamType = getFormValue(formData.get("scamType") as string | string[] | null)
      amount = getFormValue(formData.get("amount") as string | string[] | null)
      currency = getFormValue(formData.get("currency") as string | string[] | null)
      timeline = getFormValue(formData.get("timeline") as string | string[] | null)
      description = getFormValue(formData.get("description") as string | string[] | null)

      const txHashesStr = getFormValue(formData.get("transactionHashes") as string | string[] | null)
      const bankRefsStr = getFormValue(formData.get("bankReferences") as string | string[] | null)

      transactionHashes = parseJSONArray(txHashesStr)
      bankReferences = parseJSONArray(bankRefsStr)

      // Process file uploads
      const files = formData.getAll("files")
      for (const file of files) {
        if (file instanceof File) {
          // Validate file size
          if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
            return NextResponse.json(
              {
                success: false,
                error: `File "${file.name}" exceeds maximum size of ${MAX_FILE_SIZE_MB}MB`,
              },
              { status: 400 },
            )
          }

          // Validate file type
          if (!validateFileType(file, ALLOWED_MIME_TYPES)) {
            return NextResponse.json(
              {
                success: false,
                error: `File type not allowed for "${file.name}". Allowed types: JPG, PNG, PDF, TXT, DOC, DOCX`,
              },
              { status: 400 },
            )
          }

          totalFileSize += file.size
          uploadedFiles.push({ name: file.name, size: file.size })
        }
      }

      // Check total file size
      if (totalFileSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: `Total file size exceeds maximum of ${MAX_TOTAL_SIZE_MB}MB`,
          },
          { status: 400 },
        )
      }
    } else {
      // Handle application/json
      const body = await request.json()
      fullName = body.fullName || ""
      contactEmail = body.contactEmail || ""
      contactPhone = body.contactPhone || ""
      scamType = body.scamType || ""
      amount = body.amount || ""
      currency = body.currency || ""
      timeline = body.timeline || ""
      description = body.description || ""
      transactionHashes = body.transactionHashes || []
      bankReferences = body.bankReferences || []
    }

    // Validate required fields
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
        { status: 400 },
      )
    }

    // Generate case ID
    const caseId = generateCaseId("CSRU")

    // Log submission for audit trail
    logSubmission({
      caseId,
      formName: "fraud-report",
      fullName,
      email: contactEmail,
      scamType,
      amount,
      currency,
      timeline,
      description,
      contactPhone,
      transactionHashes,
      bankReferences,
      filesUploaded: uploadedFiles.length,
      fileNames: uploadedFiles.map((f) => f.name),
      timestamp: new Date().toISOString(),
      ip: clientIp,
      userAgent: request.headers.get("user-agent") || "unknown",
      status: "submitted",
    })

    return NextResponse.json(
      {
        success: true,
        caseId,
        message: "Fraud report received successfully. We will review your case shortly.",
        filesProcessed: uploadedFiles.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[Fraud Report API Error]:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}
