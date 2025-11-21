import { NextRequest, NextResponse } from "next/server"
import { validateContactForm } from "@/lib/utils/validation"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { logSubmission } from "@/lib/submission-logger"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
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
    const validation = validateContactForm({
      name: body.name || "",
      email: body.email || "",
      subject: body.subject || "",
      message: body.message || "",
    })

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 },
      )
    }

    // Log submission for audit trail
    logSubmission({
      caseId: `CONTACT-${Date.now()}`,
      formName: "contact",
      fullName: body.name,
      email: body.email,
      scamType: "general-inquiry",
      contactPhone: body.phone || "",
      description: body.message,
      transactionHashes: [],
      bankReferences: [],
      filesUploaded: 0,
      fileNames: [],
      timestamp: new Date().toISOString(),
      ip: clientIp,
      userAgent: request.headers.get("user-agent") || "unknown",
      status: "submitted",
    })

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you shortly.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[Contact Form API Error]:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 },
    )
  }
}
