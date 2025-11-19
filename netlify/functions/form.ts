import { Handler, HandlerEvent } from "@netlify/functions"

interface SubmissionRecord {
  caseId: string
  formName: string
  fullName: string
  email: string
  scamType: string
  amount?: string
  currency?: string
  timeline?: string
  description?: string
  contactPhone?: string
  transactionHashes: string[]
  bankReferences: string[]
  filesUploaded: number
  fileNames: string[]
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
      formData = parseMultipartFormData(event.body || "", contentType)
    }

    const formName = formData["form-name"]

    if (!formName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "form-name is required" }),
      }
    }

    // Validate required fields
    if (!formData.fullName || !formData.contactEmail || !formData.scamType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: fullName, contactEmail, scamType" }),
      }
    }

    const timestamp = new Date().toISOString()
    const caseId = `CSRU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Extract transaction hashes and bank references as arrays
    const transactionHashes = Array.isArray(formData["transactionHashes[]"])
      ? formData["transactionHashes[]"]
      : formData["transactionHashes[]"]
        ? [formData["transactionHashes[]"]]
        : []

    const bankReferences = Array.isArray(formData["bankReferences[]"])
      ? formData["bankReferences[]"]
      : formData["bankReferences[]"]
        ? [formData["bankReferences[]"]]
        : []

    const submission = {
      formName,
      caseId,
      email: formData.contactEmail,
      fullName: formData.fullName,
      scamType: formData.scamType,
      amount: formData.amount,
      currency: formData.currency,
      timeline: formData.timeline,
      description: formData.description,
      contactPhone: formData.contactPhone,
      transactionHashes,
      bankReferences,
      filesUploaded: formData.fileCount || 0,
      fileNames: formData.fileNames || [],
      timestamp,
      ip: event.headers["client-ip"] || event.headers["x-forwarded-for"] || "unknown",
      userAgent: event.headers["user-agent"] || "unknown",
    }

    console.log("Fraud report submission received:", submission)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Form submitted successfully",
        caseId,
        submissionTime: timestamp,
      }),
    }
  } catch (error) {
    console.error("Form handler error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process form submission",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    }
  }
}

function parseMultipartFormData(body: string, contentType: string): Record<string, any> {
  const formData: Record<string, any> = {}
  const fileNames: string[] = []

  // Extract boundary from content-type
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

    // Parse field name
    const nameMatch = headers.match(/name="([^"]+)"/)
    if (!nameMatch) continue

    const fieldName = nameMatch[1]

    // Check if it's a file
    const filenameMatch = headers.match(/filename="([^"]+)"/)
    if (filenameMatch) {
      const filename = filenameMatch[1]
      fileNames.push(filename)
      if (!formData.fileCount) {
        formData.fileCount = 0
      }
      formData.fileCount++
    } else {
      // Regular field
      if (fieldName.endsWith("[]")) {
        const baseFieldName = fieldName.slice(0, -2)
        if (!formData[fieldName]) {
          formData[fieldName] = []
        }
        if (Array.isArray(formData[fieldName])) {
          formData[fieldName].push(content)
        }
      } else {
        formData[fieldName] = content
      }
    }
  }

  formData.fileNames = fileNames
  return formData
}

export { handler }
