/**
 * Startup validation hook - runs at Next.js startup
 * This file uses plain JavaScript to work with next.config.mjs
 */

function isTruthy(value) {
  return typeof value === "string" && value.trim().length > 0
}

function validateStartup() {
  const missingVars = []
  const warnings = []

  // Check critical variables
  if (!isTruthy(process.env.WEB3FORMS_API_KEY)) {
    missingVars.push("WEB3FORMS_API_KEY - Required for contact and fraud report forms")
  }

  // Check email configuration
  const hasResend = isTruthy(process.env.RESEND_API_KEY)
  const hasSmtp = isTruthy(process.env.SMTP_HOST)

  if (!hasResend && !hasSmtp) {
    warnings.push("No email service configured. Set RESEND_API_KEY or SMTP_* variables for email functionality.")
  }

  // Check SMTP consistency
  const smtpVars = {
    SMTP_HOST: isTruthy(process.env.SMTP_HOST),
    SMTP_PORT: isTruthy(process.env.SMTP_PORT),
    SMTP_USER: isTruthy(process.env.SMTP_USER),
    SMTP_PASS: isTruthy(process.env.SMTP_PASS),
    SMTP_FROM: isTruthy(process.env.SMTP_FROM),
    EMAIL_FROM: isTruthy(process.env.EMAIL_FROM),
  }

  const hasAnySmtp = Object.values(smtpVars).some((v) => v)
  const missingSmtp = Object.entries(smtpVars)
    .filter(([key, v]) => !v && key !== "SMTP_FROM" && key !== "EMAIL_FROM")
    .map(([key]) => key)

  if (hasAnySmtp && missingSmtp.length > 0 && !(smtpVars.SMTP_FROM || smtpVars.EMAIL_FROM)) {
    warnings.push(`Incomplete SMTP configuration. Missing: ${missingSmtp.join(", ")}`)
  }

  // Display errors
  if (missingVars.length > 0) {
    const errorMsg = `
═════════════════════════════════════════���══════════════════════════════════════
  CRITICAL: Missing Environment Variables
════════════════════════════════════════════════════════════════════════════════
  
${missingVars.map((v) => `  ✗ ${v}`).join("\n")}

Please set the missing environment variables before starting the server.
════════════════════════════════════════════════════════════════════════════════
`
    console.error(errorMsg)
    process.exit(1)
  }

  // Display warnings
  if (warnings.length > 0) {
    const warningMsg = `
════════════════════════════════════════════════════════════════════════════════
  WARNINGS: Environment Configuration
════════════════════════════════════════════════��═══════════════════════════════
  
${warnings.map((w) => `  ⚠ ${w}`).join("\n")}

════════════════════════════════════════════════════════════════════════════════
`
    console.warn(warningMsg)
  }

  return {
    isValid: missingVars.length === 0,
    criticalErrors: missingVars,
    warnings,
  }
}

module.exports = { validateStartup }
