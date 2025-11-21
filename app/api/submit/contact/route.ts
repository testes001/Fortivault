import { NextRequest, NextResponse } from "next/server"
import { validateContactForm } from "@/lib/utils/validation"
import { rateLimiter } from "@/lib/security/rate-limiter"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
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
  try {
    // Redundant configuration check
    const configCheck = validateConfiguration()
    if (!configCheck.valid) {
      console.error("[Contact API] Configuration validation failed:", configCheck.error)
      return NextResponse.json(
        {
          success: false,
          message: configCheck.error || "Server is not properly configured. Please try again later.",
          code: "CONFIG_ERROR",
        },
        { status: 503 }
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

    const body = await request.json()

    // Extract and validate fields
    const name = (body.name || "").trim()
    const email = (body.email || "").trim()
    const subject = (body.subject || "").trim()
    const message = (body.message || "").trim()
    const phone = (body.phone || "").trim()

    // Validate required fields server-side
    const validation = validateContactForm({
      name,
      email,
      subject,
      message,
    })

    if (!validation.valid) {
      console.error("[Contact API] Validation failed:", {
        errors: validation.errors,
        providedFields: {
          name: name ? "[provided]" : "[missing]",
          email: email ? "[provided]" : "[missing]",
          subject: subject ? "[provided]" : "[missing]",
          message: message ? "[provided]" : "[missing]",
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

    // Create Web3Forms submission
    const web3formsData = new FormData()
    web3formsData.append("access_key", WEB3FORMS_API_KEY)
    web3formsData.append("form_name", "contact")
    web3formsData.append("name", name)
    web3formsData.append("email", email)
    web3formsData.append("subject", subject)
    web3formsData.append("message", message)
    if (phone) {
      web3formsData.append("phone", phone)
    }
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
      console.error("[Contact API] Web3Forms submission failed:", web3formsResult)
      return NextResponse.json(
        { success: false, message: web3formsResult.message || "Submission failed. Please try again." },
        { status: 400 }
      )
    }

    console.log(`[Contact API] Successful submission - Email: ${email}`)

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you shortly.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Contact API] Error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    )
  }
}
