import { NextRequest, NextResponse } from "next/server"
import { generateCaseId } from "@/lib/utils/case-id-generator"
import { validateFraudReport } from "@/lib/utils/validation"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { logSubmission } from "@/lib/submission-logger"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
}

export const runtime = "nodejs"

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

    const body = await request.json()

    // Validate required fields
    const validation = validateFraudReport({
      fullName: body.fullName || "",
      contactEmail: body.contactEmail || "",
      scamType: body.scamType || "",
      amount: body.amount || "",
      currency: body.currency || "",
      timeline: body.timeline || "",
      description: body.description || "",
      transactionHashes: body.transactionHashes || [],
      bankReferences: body.bankReferences || [],
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
      fullName: body.fullName,
      email: body.contactEmail,
      scamType: body.scamType,
      amount: body.amount,
      currency: body.currency,
      timeline: body.timeline,
      description: body.description,
      contactPhone: body.contactPhone || "",
      transactionHashes: body.transactionHashes || [],
      bankReferences: body.bankReferences || [],
      filesUploaded: body.fileCount || 0,
      fileNames: body.fileNames || [],
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
