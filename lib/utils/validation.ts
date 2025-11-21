export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateAmount(amount: string): boolean {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0
}

export function validatePhone(phone: string): boolean {
  // Allow optional phone
  if (!phone || phone.trim().length === 0) return true
  const phoneRegex = /^[\d+\-\s()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type) || allowedTypes.some((type) => type.endsWith("/*") && file.type.startsWith(type.split("/")[0]))
}

export function getFileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}

export function validateFraudReport(data: {
  fullName: string
  contactEmail: string
  scamType: string
  amount: string
  currency: string
  timeline: string
  description: string
  transactionHashes?: string[]
  bankReferences?: string[]
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.push("Full name is required")
  }

  if (!data.contactEmail || !validateEmail(data.contactEmail)) {
    errors.push("Valid email address is required")
  }

  if (!data.scamType || data.scamType.trim().length === 0) {
    errors.push("Scam type is required")
  }

  if (!data.amount || !validateAmount(data.amount)) {
    errors.push("Valid amount is required")
  }

  if (!data.currency || data.currency.trim().length === 0) {
    errors.push("Currency is required")
  }

  if (!data.timeline || data.timeline.trim().length === 0) {
    errors.push("Timeline is required")
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Description is required")
  }

  const hasTransactionRef =
    (data.transactionHashes && data.transactionHashes.length > 0) ||
    (data.bankReferences && data.bankReferences.length > 0)

  if (!hasTransactionRef) {
    errors.push("At least one transaction hash or bank reference is required")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateContactForm(data: {
  name: string
  email: string
  subject: string
  message: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required")
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push("Valid email address is required")
  }

  if (!data.subject || data.subject.trim().length === 0) {
    errors.push("Subject is required")
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push("Message is required")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
