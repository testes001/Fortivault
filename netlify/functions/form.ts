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
    const formData = new URLSearchParams(body)

    const formName = formData.get("form-name")

    if (!formName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "form-name is required" }),
      }
    }

    const formSubmission = {
      formName,
      data: Object.fromEntries(formData),
      timestamp: new Date().toISOString(),
      userAgent: event.headers["user-agent"],
      ip: event.headers["client-ip"] || event.headers["x-forwarded-for"],
    }

    console.log("Form submission received:", formSubmission)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Form submitted successfully",
        caseId: `CSRU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      }),
    }
  } catch (error) {
    console.error("Form handler error:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process form submission",
      }),
    }
  }
}

export { handler }
