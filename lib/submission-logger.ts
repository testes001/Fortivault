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
  status: "submitted" | "received" | "processed"
}

const SUBMISSIONS_LOG: SubmissionRecord[] = []

export function logSubmission(submission: SubmissionRecord): void {
  const record = {
    ...submission,
    status: "received" as const,
  }

  SUBMISSIONS_LOG.push(record)

  // Log to console for debugging and Netlify logs
  console.log("=".repeat(80))
  console.log(`📋 FRAUD REPORT SUBMISSION - Case ID: ${record.caseId}`)
  console.log("=".repeat(80))
  console.log(JSON.stringify(record, null, 2))
  console.log("=".repeat(80))

  // In production, you would send this to:
  // - A database (Supabase, Neon, etc.)
  // - A monitoring service (Sentry, DataDog, etc.)
  // - A storage service (AWS S3, Azure Blob, etc.)
  // - Email notifications
}

export function getSubmissions(): SubmissionRecord[] {
  return SUBMISSIONS_LOG
}

export function getSubmissionByCaseId(caseId: string): SubmissionRecord | undefined {
  return SUBMISSIONS_LOG.find((s) => s.caseId === caseId)
}
