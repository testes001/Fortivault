import { Handler, HandlerEvent } from "@netlify/functions"
import { IncomingForm } from "formidable"
import fs from "fs"
import path from "path"

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    }
  }

  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body || "", "base64") : event.body || ""
    const contentType = event.headers["content-type"] || ""

    let formFields: Record<string, any> = {}
    let formFiles: Record<string, any[]> = {}

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(body as string)
      formFields = Object.fromEntries(params)
    } else if (contentType.includes("multipart/form-data")) {
      const form = new IncomingForm({
        uploadDir: "/tmp",
        keepExtensions: true,
      })

      await new Promise((resolve, reject) => {
        form.parse(
          {
            headers: event.headers,
            on: (event: string, chunk: any) => {
              if (event === "data") {
                // Not needed for form parsing
              }
            },
            once: (event: string, handler: any) => {
              // Not needed for form parsing
            },
          } as any,
          (err: Error | null, fields: any, files: any) => {
            if (err) reject(err)
            formFields = fields
            formFiles = files
            resolve(null)
          }
        )
      })
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid content type" }),
      }
    }

    const formName = formFields["form-name"] || formFields.form_name

    if (!formName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "form-name is required" }),
      }
    }

    const fileCount = Object.keys(formFiles).reduce((count, key) => {
      const files = formFiles[key]
      return count + (Array.isArray(files) ? files.length : 1)
    }, 0)

    const formSubmission = {
      formName,
      data: formFields,
      files: fileCount,
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
        submissionTime: formSubmission.timestamp,
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
