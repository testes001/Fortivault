import { Handler, HandlerEvent } from "@netlify/functions"

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const body = event.body || ""
    const contentType = event.headers["content-type"] || ""

    let formData: Record<string, any> = {}

    if (contentType.includes("application/json")) {
      formData = JSON.parse(body)
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body)
      formData = Object.fromEntries(params)
    } else if (contentType.includes("multipart/form-data")) {
      const params = new URLSearchParams(body.split("--")[0])
      formData = Object.fromEntries(params)
    }

    const formName = formData["form-name"]

    if (!formName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "form-name is required" }),
      }
    }

    const timestamp = new Date().toISOString()
    const caseId = `CSRU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const submission = {
      formName,
      caseId,
      email: formData.contactEmail,
      fullName: formData.fullName,
      scamType: formData.scamType,
      amount: formData.amount,
      timestamp,
      ip: event.headers["client-ip"] || event.headers["x-forwarded-for"] || "unknown",
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

export { handler }
