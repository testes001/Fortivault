import { Handler, HandlerEvent } from "@netlify/functions"

interface ContactSubmission {
  formName: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  subject: string
  message: string
  timestamp: string
  ip: string
  userAgent: string
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const contentType = event.headers["content-type"] || ""
    let formData: Record<string, any> = {}

    if (contentType.includes("application/json")) {
      formData = JSON.parse(event.body || "{}")
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(event.body)
      formData = Object.fromEntries(params)
    } else if (contentType.includes("multipart/form-data")) {
      formData = parseFormData(event.body || "", contentType)
    }

    const formName = formData["form-name"]

    if (!formName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "form-name is required" }),
      }
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required fields: firstName, lastName, email, subject, message",
        }),
      }
    }

    const timestamp = new Date().toISOString()
    const submission: ContactSubmission = {
      formName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      timestamp,
      ip: event.headers["client-ip"] || event.headers["x-forwarded-for"] || "unknown",
      userAgent: event.headers["user-agent"] || "unknown",
    }

    logContactSubmission(submission)

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Contact message received successfully",
        submissionTime: timestamp,
      }),
    }
  } catch (error) {
    console.error("Contact form handler error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process contact form",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    }
  }
}

function logContactSubmission(submission: ContactSubmission): void {
  console.log("\n" + "=".repeat(100))
  console.log(`📧 CONTACT FORM SUBMISSION RECEIVED`)
  console.log("=".repeat(100))
  console.log(`Time: ${submission.timestamp}`)
  console.log(`Form: ${submission.formName}`)
  console.log("-".repeat(100))
  console.log(`Name: ${submission.firstName} ${submission.lastName}`)
  console.log(`Email: ${submission.email}`)
  if (submission.phone) console.log(`Phone: ${submission.phone}`)
  console.log(`Subject: ${submission.subject}`)
  console.log(`Message: ${submission.message.substring(0, 150)}...`)
  console.log("-".repeat(100))
  console.log(`IP Address: ${submission.ip}`)
  console.log(`User Agent: ${submission.userAgent}`)
  console.log("=".repeat(100) + "\n")

  // Log full JSON for archival
  console.log("FULL_CONTACT_SUBMISSION_DATA:", JSON.stringify(submission, null, 2))
}

function parseFormData(body: string, contentType: string): Record<string, any> {
  const formData: Record<string, any> = {}

  const boundaryMatch = contentType.match(/boundary=([^;]+)/)
  if (!boundaryMatch) {
    return formData
  }

  const boundary = boundaryMatch[1].trim()
  const parts = body.split(`--${boundary}`)

  for (const part of parts) {
    if (!part || part === "--\r\n" || part === "--") continue

    const headerEnd = part.indexOf("\r\n\r\n")
    if (headerEnd === -1) continue

    const headers = part.substring(0, headerEnd)
    const content = part.substring(headerEnd + 4).replace(/\r\n$/, "")

    const nameMatch = headers.match(/name="([^"]+)"/)
    if (!nameMatch) continue

    const fieldName = nameMatch[1]
    formData[fieldName] = content
  }

  return formData
}

export { handler }
