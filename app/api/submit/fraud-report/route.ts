import { NextRequest, NextResponse } from "next/server"
import { validateFraudReport } from "@/lib/utils/validation"
import { validateApiKey } from "@/lib/config/api-key-validator"
import { rateLimiter } from "@/lib/security/rate-limiter"

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
}

const WEB3FORMS_API_KEY = process.env.WEB3FORMS_API_KEY
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

// File upload constraints
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB per file
const MAX_TOTAL_SIZE_BYTES = 50 * 1024 * 1024 // 50MB total
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export const runtime = "nodejs"


/**
 * Validates a file's size and type
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    const maxMB = MAX_FILE_SIZE_BYTES / (1024 * 1024)
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of ${maxMB}MB (actual: ${sizeMB}MB)`,
    }
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File "${file.name}" has unsupported type "${file.type}". Allowed types: JPG, PNG, PDF, TXT, DOC, DOCX`,
    }
  }

  return { valid: true }
}

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    const configCheck = validateApiKey(WEB3FORMS_API_KEY, "WEB3FORMS_API_KEY")
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

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, message: "Invalid content type. Expected multipart/form-data." },
        { status: 400 }
      )
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown parsing error"
      console.error("[Fraud Report API] Error parsing FormData:", errorMsg)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Please ensure you are sending valid form data.",
          code: "INVALID_FORM_DATA",
        },
        { status: 400 }
      )
    }

    // Extract form fields
    const fullName = formData.get("fullName")?.toString() || ""
    const contactEmail = formData.get("contactEmail")?.toString() || ""
    const contactPhone = formData.get("contactPhone")?.toString() || ""
    const scamType = formData.get("scamType")?.toString() || ""
    const amount = formData.get("amount")?.toString() || ""
    const currency = formData.get("currency")?.toString() || ""
    const timeline = formData.get("timeline")?.toString() || ""
    const description = formData.get("description")?.toString() || ""
    const filesCount = parseInt(formData.get("filesCount")?.toString() || "0", 10)

    // Parse JSON arrays
    let transactionHashes: string[] = []
    let bankReferences: string[] = []
    try {
      const txHashesStr = formData.get("transactionHashes")?.toString() || "[]"
      transactionHashes = JSON.parse(txHashesStr)
      const bankRefsStr = formData.get("bankReferences")?.toString() || "[]"
      bankReferences = JSON.parse(bankRefsStr)
    } catch (error) {
      console.error("[Fraud Report API] Error parsing arrays:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid format for transaction or bank references.",
          code: "INVALID_ARRAY_FORMAT",
        },
        { status: 400 }
      )
    }

    console.log("[Fraud Report API] Received submission:", {
      fullName,
      contactEmail,
      scamType,
      amount,
      currency,
      filesCount,
    })

    // Validate form data
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

    // Extract and validate files
    const files: File[] = []
    const fileErrors: string[] = []
    let totalFileSize = 0

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("evidenceFile_") && value instanceof File) {
        const fileValidation = validateFile(value)
        if (!fileValidation.valid) {
          fileErrors.push(fileValidation.error || `File validation failed for ${value.name}`)
          continue
        }

        totalFileSize += value.size
        if (totalFileSize > MAX_TOTAL_SIZE_BYTES) {
          fileErrors.push(
            `Total file size (${(totalFileSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum of ${MAX_TOTAL_SIZE_BYTES / (1024 * 1024)}MB`
          )
          break
        }

        files.push(value)
      }
    }

    if (fileErrors.length > 0) {
      console.error("[Fraud Report API] File validation errors:", fileErrors)
      return NextResponse.json(
        {
          success: false,
          message: "File validation failed",
          errors: fileErrors,
          code: "FILE_VALIDATION_ERROR",
        },
        { status: 400 }
      )
    }

    // Create FormData for web3forms with actual files
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
    web3formsData.append("filesCount", files.length.toString())
    web3formsData.append("clientIp", clientIp)
    web3formsData.append("userAgent", request.headers.get("user-agent") || "unknown")
    web3formsData.append("submittedAt", new Date().toISOString())

    // Append actual files to web3forms submission
    files.forEach((file, index) => {
      web3formsData.append(`file_${index}`, file, file.name)
    })

    // Submit to web3forms with file attachments
    let web3formsResponse: Response
    try {
      web3formsResponse = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: web3formsData,
        signal: AbortSignal.timeout(30000), // 30 second timeout for file uploads
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("[Fraud Report API] Error contacting Web3Forms:", {
        error: errorMsg,
        endpoint: WEB3FORMS_ENDPOINT,
        filesSubmitted: files.length,
        totalFileSize: totalFileSize,
        timestamp: new Date().toISOString(),
      })

      // Handle timeout vs other network errors
      const isTimeout = errorMsg.includes("timeout") || errorMsg.includes("signal")
      const message = isTimeout
        ? "File upload took too long. Please try again with smaller files."
        : "Unable to process your submission at this time. Please try again in a few moments."

      return NextResponse.json(
        {
          success: false,
          message,
          code: "SUBMISSION_SERVICE_ERROR",
        },
        { status: 503 }
      )
    }

    // Parse web3forms response
    let web3formsResult: any
    try {
      web3formsResult = await web3formsResponse.json()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error"
      console.error("[Fraud Report API] Error parsing Web3Forms response:", {
        error: errorMsg,
        status: web3formsResponse.status,
        statusText: web3formsResponse.statusText,
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

    // Check for web3forms response errors
    if (!web3formsResponse.ok) {
      console.error("[Fraud Report API] Web3Forms returned error:", {
        status: web3formsResponse.status,
        statusText: web3formsResponse.statusText,
        response: web3formsResult,
        filesSubmitted: files.length,
      })

      // Specific error messages based on status
      let userMessage = "Unable to process your submission. Please try again later."
      let statusCode = 503

      if (web3formsResponse.status === 400) {
        userMessage = "Invalid submission data. Please check your information and try again."
        statusCode = 400
      } else if (web3formsResponse.status === 401 || web3formsResponse.status === 403) {
        userMessage = "Server authentication failed. Please contact support."
        statusCode = 503
      } else if (web3formsResponse.status === 413) {
        userMessage = "Files are too large. Please reduce file sizes and try again."
        statusCode = 413
      } else if (web3formsResponse.status === 429) {
        userMessage = "Too many submissions. Please wait a moment and try again."
        statusCode = 429
      } else if (web3formsResponse.status >= 500) {
        userMessage = "The submission service is temporarily unavailable. Please try again in a few moments."
        statusCode = 503
      }

      return NextResponse.json(
        {
          success: false,
          message: userMessage,
          code: "SUBMISSION_SERVICE_ERROR",
        },
        { status: statusCode }
      )
    }

    // Check if web3forms reported success
    if (!web3formsResult.success) {
      console.error("[Fraud Report API] Web3Forms submission rejected:", {
        response: web3formsResult,
        caseEmail: contactEmail,
        filesSubmitted: files.length,
      })

      const errorMessage =
        web3formsResult.message || "Your submission could not be processed. Please try again."
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          code: "SUBMISSION_REJECTED",
        },
        { status: 400 }
      )
    }

    // Successful submission
    const caseId = `CSRU-${Date.now().toString(36).toUpperCase()}`
    console.log(`[Fraud Report API] Successful submission with files:`, {
      caseId,
      email: contactEmail,
      filesSubmitted: files.length,
      totalFileSize: totalFileSize,
      totalFileSizeMB: (totalFileSize / (1024 * 1024)).toFixed(2),
    })

    return NextResponse.json(
      {
        success: true,
        caseId,
        message: "Fraud report received successfully. We will review your case shortly.",
        filesProcessed: files.length,
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error"
    console.error("[Fraud Report API] Unexpected error:", {
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
