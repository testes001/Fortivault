import { Handler, HandlerEvent } from "@netlify/functions"
import busboy from "busboy"

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
    let fileCount = 0

    if (contentType.includes("multipart/form-data")) {
      formData = await parseMultipartForm(event, contentType)
      fileCount = (formData.evidenceFiles as any[])?.length || 0
    } else if (contentType.includes("application/json")) {
      formData = JSON.parse(event.body || "{}")
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(event.body)
      formData = Object.fromEntries(params)
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
      transactionHashesCount: (formData.transactionHashes as any[])?.length || 0,
      bankReferencesCount: (formData.bankReferences as any[])?.length || 0,
      filesUploaded: fileCount,
      timestamp,
      ip: event.headers["client-ip"] || event.headers["x-forwarded-for"] || "unknown",
      userAgent: event.headers["user-agent"] || "unknown",
    }

    console.log("Fraud report submission received:", submission)

    // Store submission metadata (without files due to serverless limitations)
    // In production, you would store this in a database
    const submissionRecord = {
      ...submission,
      fileNames: formData.fileNames || [],
    }
    console.log("Submission record:", submissionRecord)

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

function parseMultipartForm(event: HandlerEvent, contentType: string): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { "content-type": contentType } })
    const formData: Record<string, any> = {}
    const fileNames: string[] = []

    bb.on("file", (fieldname, file, info) => {
      const chunks: Buffer[] = []
      file.on("data", (data) => {
        chunks.push(Buffer.from(data))
      })
      file.on("end", () => {
        if (!formData[fieldname]) {
          formData[fieldname] = []
        }
        formData[fieldname].push({
          filename: info.filename,
          size: Buffer.concat(chunks).length,
        })
        fileNames.push(info.filename)
      })
      file.on("error", reject)
    })

    bb.on("field", (fieldname, val) => {
      if (fieldname.endsWith("[]")) {
        const baseFieldname = fieldname.slice(0, -2)
        if (!formData[baseFieldname]) {
          formData[baseFieldname] = []
        }
        formData[baseFieldname].push(val)
      } else {
        formData[fieldname] = val
      }
    })

    bb.on("error", reject)
    bb.on("close", () => {
      formData.fileNames = fileNames
      resolve(formData)
    })

    if (event.isBase64Encoded) {
      bb.write(Buffer.from(event.body || "", "base64"))
    } else {
      bb.write(event.body || "")
    }
    bb.end()
  })
}

export { handler }
