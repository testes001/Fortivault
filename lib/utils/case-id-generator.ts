import { randomBytes } from "crypto"

export function generateCaseId(prefix: string = "CSRU"): string {
  const randomPart = randomBytes(6).toString("hex").toUpperCase()
  const timestamp = Date.now().toString(36).toUpperCase()
  return `${prefix}-${timestamp}-${randomPart}`
}
