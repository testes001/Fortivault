import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isTruthy(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0
}

/**
 * Comprehensive health check endpoint with detailed configuration diagnostics
 * Helps developers verify environment setup and troubleshoot issues
 */
export async function GET(_req: NextRequest) {
  const timestamp = new Date().toISOString()

  // Web3Forms configuration
  const web3formsApiKey = process.env.WEB3FORMS_API_KEY
  const web3formsConfigured = isTruthy(web3formsApiKey)

  // Email service: Resend
  const resendApiKey = process.env.RESEND_API_KEY
  const resendFromEmail = process.env.RESEND_FROM_EMAIL
  const resendConfigured = isTruthy(resendApiKey) && isTruthy(resendFromEmail)

  // Email service: SMTP
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM

  const smtpConfigured =
    isTruthy(smtpHost) && isTruthy(smtpPort) && isTruthy(smtpUser) && isTruthy(smtpPass) && isTruthy(smtpFrom)

  const smtpPartiallyConfigured =
    (isTruthy(smtpHost) || isTruthy(smtpPort) || isTruthy(smtpUser) || isTruthy(smtpPass) || isTruthy(smtpFrom)) &&
    !smtpConfigured

  // Public/Non-sensitive configuration
  const formspreeUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL
  const formspreeConfigured = isTruthy(formspreeUrl)

  // Critical requirements check
  const criticalErrors: string[] = []
  if (!web3formsConfigured) {
    criticalErrors.push("WEB3FORMS_API_KEY is missing - required for form submissions")
  }

  // Optional but recommended checks
  const warnings: string[] = []
  if (!resendConfigured && !smtpConfigured) {
    warnings.push(
      "No email service configured - set RESEND_API_KEY + RESEND_FROM_EMAIL or SMTP_* variables for email functionality"
    )
  }
  if (smtpPartiallyConfigured) {
    warnings.push(
      "SMTP is partially configured - either set all SMTP variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM/EMAIL_FROM) or none"
    )
  }

  // Detailed configuration status
  const details = {
    // Critical services
    forms: {
      name: "Web3Forms (Contact & Fraud Reports)",
      configured: web3formsConfigured,
      severity: "critical",
      description: "Required for contact forms and fraud report submissions",
      status: web3formsConfigured
        ? "✓ Configured"
        : "✗ Missing WEB3FORMS_API_KEY",
    },

    // Email services (at least one recommended)
    email: {
      name: "Email Services",
      configured: resendConfigured || smtpConfigured,
      severity: "recommended",
      description: "Used for verification emails, confirmations, and notifications",
      services: {
        resend: {
          configured: resendConfigured,
          status: resendConfigured
            ? "✓ Configured"
            : isTruthy(resendApiKey)
              ? "⚠ Incomplete (missing RESEND_FROM_EMAIL)"
              : "✗ Not configured",
          details: resendConfigured
            ? "Ready for email sending via Resend API"
            : "Set RESEND_API_KEY and RESEND_FROM_EMAIL",
        },
        smtp: {
          configured: smtpConfigured,
          status: smtpConfigured
            ? "✓ Configured"
            : smtpPartiallyConfigured
              ? "⚠ Incomplete"
              : "✗ Not configured",
          details: smtpConfigured
            ? "Ready for email sending via SMTP"
            : smtpPartiallyConfigured
              ? "Some SMTP variables set but incomplete - set all of: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM/EMAIL_FROM"
              : "No SMTP variables configured",
        },
      },
    },

    // Optional third-party services
    integrations: {
      formspree: {
        name: "Formspree",
        configured: formspreeConfigured,
        severity: "optional",
        description: "Public form endpoint (non-sensitive)",
        status: formspreeConfigured ? "✓ Configured" : "⚠ Not configured",
      },
    },

    // Database info
    database: {
      provider: "SQLite",
      configured: true,
      description: "Local SQLite database for development/testing",
      status: "✓ Configured",
    },

    // Overall health
    health: {
      healthy: criticalErrors.length === 0,
      criticalErrors,
      warnings,
      timestamp,
    },
  }

  // Calculate overall status
  const isHealthy = criticalErrors.length === 0
  const hasWarnings = warnings.length > 0

  // Determine HTTP status code
  const statusCode = isHealthy ? 200 : 503
  const statusMessage = isHealthy ? "Healthy" : "Configuration issues detected"

  return NextResponse.json(
    {
      ok: isHealthy,
      status: statusMessage,
      timestamp,
      summary: {
        healthy: isHealthy,
        hasWarnings,
        criticalErrorCount: criticalErrors.length,
        warningCount: warnings.length,
      },
      details,
      // Help text
      help: {
        documentation: "https://www.builder.io/c/docs/projects",
        issues: isHealthy
          ? "No critical issues found"
          : criticalErrors.length > 0
            ? `${criticalErrors.length} critical issue(s) that must be resolved`
            : `${warnings.length} warning(s) - optional configurations recommended`,
      },
    },
    { status: statusCode }
  )
}
