import { NextRequest, NextResponse } from "next/server"
import { validateContactForm } from "@/lib/utils/validation"
import { validateApiKey } from "@/lib/config/api-key-validator"
import { rateLimiter } from "@/lib/security/rate-limiter"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
}

const WEB3FORMS_API_KEY = process.env.WEB3FORMS_API_KEY
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

export const runtime = "nodejs"


export async function POST(request: NextRequest) {
  try {
    const configCheck = validateApiKey(WEB3FORMS_API_KEY, "WEB3FORMS_API_KEY")
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
    let web3formsResponse: Response
    try {
      web3formsResponse = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: web3formsData,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("[Contact API] Error contacting Web3Forms:", {
        error: errorMsg,
        endpoint: WEB3FORMS_ENDPOINT,
        timestamp: new Date().toISOString(),
      })
      return NextResponse.json(
        {
          success: false,
          message: "Unable to process your message at this time. Please try again in a few moments.",
          code: "SUBMISSION_SERVICE_ERROR",
        },
        { status: 503 }
      )
    }

    if (!web3formsResponse.ok) {
      console.error(
        `[Contact API] Web3Forms returned status ${web3formsResponse.status}`,
        {
          status: web3formsResponse.status,
          statusText: web3formsResponse.statusText,
        }
      )

      let userMessage = "Unable to process your message. Please try again later."
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
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("[Contact API] Error parsing Web3Forms response:", {
        error: errorMsg,
        status: web3formsResponse.status,
      })
      return NextResponse.json(
        {
          success: false,
          message: "Received invalid response from submission service. Please try again.",
          code: "RESPONSE_PARSE_ERROR",
        },
        { status: 503 }
      )
    }

    if (!web3formsResult.success) {
      console.error("[Contact API] Web3Forms submission failed:", {
        response: web3formsResult,
        senderEmail: email,
      })

      return NextResponse.json(
        {
          success: false,
          message: web3formsResult.message || "Your message could not be sent. Please try again.",
          code: "SUBMISSION_REJECTED",
        },
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
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Contact API] Unexpected error:", {
      error: errorMsg,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      clientIp,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    )
  }
}
