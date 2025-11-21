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

/**
 * Validates that critical environment variables are set
 * Used for redundant checks at request time
 */
function validateConfiguration(): { valid: boolean; error?: string } {
  // Redundant check #1: Direct variable check
  if (!WEB3FORMS_API_KEY) {
    return {
      valid: false,
      error: "WEB3FORMS_API_KEY is not configured. Contact support if this persists.",
    }
  }

  // Redundant check #2: Verify it's not empty after trimming
  if (!WEB3FORMS_API_KEY.trim()) {
    return {
      valid: false,
      error: "WEB3FORMS_API_KEY is empty. Please provide a valid API key.",
    }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    // Redundant configuration check
    const configCheck = validateConfiguration()
    if (!configCheck.valid) {
      console.error("[Fraud Report API] Configuration validation failed:", configCheck.error)
      return NextResponse.json(
        {
          success: false,
          message: configCheck.error || "Server is not properly configured. Please try again later.",
          code: "CONFIG_ERROR",
        },
        { status: 503 }
      )
    }

    if (!rateLimiter.isAllowed(clientIp, RATE_LIMIT_CONFIG)) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const contentType = request.headers.get("content-type") || ""

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Invalid content type. Expected application/json." },
        { status: 400 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown parsing error"
      console.error("[Fraud Report API] Error parsing JSON:", errorMsg)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Please ensure you are sending valid JSON.",
          code: "INVALID_JSON",
          details: "The request body could not be parsed as JSON.",
        },
        { status: 400 }
      )
    }

    const fullName = body.fullName || ""
    const contactEmail = body.contactEmail || ""
    const contactPhone = body.contactPhone || ""
    const scamType = body.scamType || ""
    const amount = body.amount || ""
    const currency = body.currency || ""
    const timeline = body.timeline || ""
    const description = body.description || ""
    const transactionHashes = Array.isArray(body.transactionHashes) ? body.transactionHashes : []
    const bankReferences = Array.isArray(body.bankReferences) ? body.bankReferences : []
    const filesCount = body.filesCount || 0

    console.log("[Fraud Report API] Received submission:", {
      fullName,
      contactEmail,
      scamType,
      amount,
      currency,
      filesCount,
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
      console.error("[Fraud Report API] Validation failed:", {
        errors: validation.errors,
        providedFields: {
          fullName: fullName ? "[provided]" : "[missing]",
          contactEmail: contactEmail ? "[provided]" : "[missing]",
          scamType: scamType ? "[provided]" : "[missing]",
          amount: amount ? "[provided]" : "[missing]",
          currency: currency ? "[provided]" : "[missing]",
          timeline: timeline ? "[provided]" : "[missing]",
          description: description ? "[provided]" : "[missing]",
        },
      })
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
          message: validation.errors[0] || "Validation failed",
          code: "VALIDATION_ERROR",
        },
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
    web3formsData.append("filesCount", filesCount.toString())
    web3formsData.append("clientIp", clientIp)
    web3formsData.append("userAgent", request.headers.get("user-agent") || "unknown")
    web3formsData.append("submittedAt", new Date().toISOString())

    let web3formsResponse: Response
    try {
      web3formsResponse = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: web3formsData,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("[Fraud Report API] Error contacting Web3Forms:", {
        error: errorMsg,
        endpoint: WEB3FORMS_ENDPOINT,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json(
        {
          success: false,
          message: "Unable to process your submission at this time. Please try again in a few moments.",
          code: "SUBMISSION_SERVICE_ERROR",
          details: "The form submission service is temporarily unavailable.",
        },
        { status: 503 }
      )
    }

    if (!web3formsResponse.ok) {
      console.error(
        `[Fraud Report API] Web3Forms returned status ${web3formsResponse.status}`,
        {
          status: web3formsResponse.status,
          statusText: web3formsResponse.statusText,
        }
      )

      // More specific error messages based on status code
      let userMessage = "Unable to process your submission. Please try again later."
      if (web3formsResponse.status === 401 || web3formsResponse.status === 403) {
        userMessage = "Server authentication failed. Please contact support."
      } else if (web3formsResponse.status === 429) {
        userMessage = "Too many submissions. Please wait a moment and try again."
      } else if (web3formsResponse.status >= 500) {
        userMessage = "The submission service is temporarily unavailable. Please try again in a few moments."
      }

      return NextResponse.json(
        {
          success: false,
          message: userMessage,
          code: "SUBMISSION_SERVICE_ERROR",
        },
        { status: 503 }
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
        filesProcessed: filesCount,
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
