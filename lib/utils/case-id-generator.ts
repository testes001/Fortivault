import { randomBytes } from "crypto"

export function generateCaseId(prefix: string = "CSRU"): string {
  // Use 8 bytes (16 hex chars) of cryptographic random data for better uniqueness
  const randomPart = randomBytes(8).toString("hex").toUpperCase()
  // Use timestamp with milliseconds for temporal ordering
  const timestamp = Date.now().toString(16).toUpperCase()
  // Format: CSRU-TIMESTAMP-RANDOM (e.g., CSRU-1A2B3C4D-F5E6D7C8B9A0F1E2)
  return `${prefix}-${timestamp}-${randomPart}`
}
