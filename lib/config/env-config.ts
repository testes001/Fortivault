/**
 * Environment Configuration Validation
 * 
 * This module handles validation of all environment variables required by the application.
 * It provides clear error messages and runs at startup to catch configuration issues early.
 * 
 * Usage:
 * - Server startup: validateEnvironment() is called automatically
 * - Runtime checks: use getEnvVar() for safe access with fallback
 * - Status checks: use getConfigStatus() for diagnostics
 */

export interface EnvVar {
  name: string
  required: boolean
  description: string
  category: "core" | "forms" | "email" | "smtp" | "security"
}

export interface ValidationError {
  variable: string
  message: string
  category: string
  severity: "critical" | "warning"
}

export interface ConfigStatus {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  configuredServices: string[]
}

// Define all expected environment variables
const ENV_VARIABLES: EnvVar[] = [
  // Core / Forms
  {
    name: "WEB3FORMS_API_KEY",
    required: true,
    description: "API key for Web3Forms submission service (contact & fraud report forms)",
    category: "forms",
  },
  // Email Services
  {
    name: "RESEND_API_KEY",
    required: false,
    description: "API key for Resend email service (OTP and confirmation emails)",
    category: "email",
  },
  {
    name: "RESEND_FROM_EMAIL",
    required: false,
    description: "Sender email address for Resend emails",
    category: "email",
  },
  // SMTP Configuration (for alternative email service)
  {
    name: "SMTP_HOST",
    required: false,
    description: "SMTP server hostname for email sending",
    category: "smtp",
  },
  {
    name: "SMTP_PORT",
    required: false,
    description: "SMTP server port",
    category: "smtp",
  },
  {
    name: "SMTP_USER",
    required: false,
    description: "SMTP authentication username",
    category: "smtp",
  },
  {
    name: "SMTP_PASS",
    required: false,
    description: "SMTP authentication password",
    category: "smtp",
  },
  {
    name: "SMTP_FROM",
    required: false,
    description: "Default sender email address for SMTP",
    category: "smtp",
  },
  {
    name: "EMAIL_FROM",
    required: false,
    description: "Fallback sender email address (used if SMTP_FROM not set)",
    category: "smtp",
  },
  // Public / Non-sensitive
  {
    name: "NEXT_PUBLIC_FORMSPREE_URL",
    required: false,
    description: "Public Formspree endpoint for form submissions",
    category: "forms",
  },
]

/**
 * Checks if an environment variable is set and has a non-empty value
 */
function isTruthy(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0
}

/**
 * Validates a single environment variable
 */
function validateVariable(envVar: EnvVar): ValidationError | null {
  const value = process.env[envVar.name]

  if (envVar.required && !isTruthy(value)) {
    return {
      variable: envVar.name,
      message: `Missing required environment variable: ${envVar.name}. ${envVar.description}`,
      category: envVar.category,
      severity: "critical",
    }
  }

  return null
}

/**
 * Validates SMTP configuration as a group
 * Either all SMTP variables should be set, or none
 */
function validateSmtpConfig(): ValidationError[] {
  const smtpVars = [
    process.env.SMTP_HOST,
    process.env.SMTP_PORT,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
    process.env.SMTP_FROM || process.env.EMAIL_FROM,
  ]

  const hasSmtpVars = smtpVars.some((v) => isTruthy(v))
  const missingSmtpVars = smtpVars.filter((v) => !isTruthy(v))

  const errors: ValidationError[] = []

  if (hasSmtpVars && missingSmtpVars.length > 0) {
    errors.push({
      variable: "SMTP_*",
      message:
        "SMTP configuration is incomplete. If using SMTP for email, all of the following must be set: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and either SMTP_FROM or EMAIL_FROM.",
      category: "smtp",
      severity: "warning",
    })
  }

  return errors
}

/**
 * Validates email service configuration
 * Should have at least one email service configured (Resend or SMTP)
 */
function validateEmailConfig(): ValidationError[] {
  const hasResend = isTruthy(process.env.RESEND_API_KEY)
  const hasSmtp = isTruthy(process.env.SMTP_HOST)

  const errors: ValidationError[] = []

  if (!hasResend && !hasSmtp) {
    errors.push({
      variable: "EMAIL_SERVICES",
      message:
        "No email service configured. For email functionality, configure either RESEND_API_KEY (for Resend) or SMTP_* variables (for SMTP).",
      category: "email",
      severity: "warning",
    })
  }

  return errors
}

/**
 * Gets the current configuration validation status
 */
export function getConfigStatus(): ConfigStatus {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const configuredServices: string[] = []

  // Validate individual variables
  for (const envVar of ENV_VARIABLES) {
    const error = validateVariable(envVar)
    if (error) {
      if (error.severity === "critical") {
        errors.push(error)
      } else {
        warnings.push(error)
      }
    } else if (isTruthy(process.env[envVar.name])) {
      // Track configured services
      if (!configuredServices.includes(envVar.category)) {
        configuredServices.push(envVar.category)
      }
    }
  }

  // Validate grouped configurations
  errors.push(...validateSmtpConfig().filter((e) => e.severity === "critical"))
  warnings.push(...validateSmtpConfig().filter((e) => e.severity === "warning"))
  errors.push(...validateEmailConfig().filter((e) => e.severity === "critical"))
  warnings.push(...validateEmailConfig().filter((e) => e.severity === "warning"))

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    configuredServices: [...new Set(configuredServices)],
  }
}

/**
 * Validates the environment and throws an error if critical variables are missing
 * This should be called at server startup
 */
export function validateEnvironment(): void {
  const status = getConfigStatus()

  if (!status.isValid) {
    const errorMessages = status.errors
      .map((err) => `  ✗ [${err.category.toUpperCase()}] ${err.message}`)
      .join("\n")

    const errorOutput = `
════════════════════════════════════════════════════════════════════════════════
  ENVIRONMENT CONFIGURATION ERROR
════════════════════════════════════════════════════════════════════════════════
  
The following critical environment variables are missing or invalid:

${errorMessages}

Please set the missing environment variables before starting the development server.

For more information, see: https://www.builder.io/c/docs/projects
═════════════════════════════════════════════════════════════════════���══════════
`

    console.error(errorOutput)
    process.exit(1)
  }

  // Log warnings if any
  if (status.warnings.length > 0) {
    const warningMessages = status.warnings
      .map((warn) => `  ⚠ [${warn.category.toUpperCase()}] ${warn.message}`)
      .join("\n")

    const warningOutput = `
════════════════════════════════════════════════════════════════════════════════
  ENVIRONMENT CONFIGURATION WARNINGS
════════════════════════════════════════════════════════════════════════════════

${warningMessages}

These are optional but recommended for full functionality.
════════════════════════════════════════════════════════════════════════════════
`

    console.warn(warningOutput)
  }

  // Log configured services
  if (status.configuredServices.length > 0) {
    console.log(`
✓ Fortivault initialized with the following services: ${status.configuredServices.join(", ")}
`)
  }
}

/**
 * Safely gets an environment variable with a fallback value
 * Includes redundant checks and error logging
 */
export function getEnvVar(name: string, fallback: string = ""): string {
  const value = process.env[name]

  // Redundant check: ensure value is a string and not empty
  if (!isTruthy(value)) {
    if (fallback) {
      return fallback
    }
    // Log warning for debugging
    console.warn(`[Config] Environment variable not found: ${name}. Returning empty string.`)
    return ""
  }

  return value.trim()
}

/**
 * Gets a boolean environment variable
 * Handles common boolean representations: true, "true", "1", "yes"
 */
export function getEnvBool(name: string, fallback: boolean = false): boolean {
  const value = process.env[name]
  if (!isTruthy(value)) {
    return fallback
  }

  return ["true", "1", "yes"].includes(value.trim().toLowerCase())
}

/**
 * Gets a numeric environment variable
 */
export function getEnvNum(name: string, fallback: number = 0): number {
  const value = process.env[name]
  if (!isTruthy(value)) {
    return fallback
  }

  const num = parseInt(value.trim(), 10)
  return isNaN(num) ? fallback : num
}

/**
 * Format configuration status for logging
 */
export function formatConfigStatus(status: ConfigStatus): string {
  const lines: string[] = []

  lines.push("Configuration Status:")
  lines.push(`  Valid: ${status.isValid ? "✓" : "✗"}`)
  lines.push(`  Configured Services: ${status.configuredServices.join(", ") || "none"}`)

  if (status.errors.length > 0) {
    lines.push(`  Critical Errors: ${status.errors.length}`)
    status.errors.forEach((err) => {
      lines.push(`    - [${err.category}] ${err.variable}: ${err.message}`)
    })
  }

  if (status.warnings.length > 0) {
    lines.push(`  Warnings: ${status.warnings.length}`)
    status.warnings.forEach((warn) => {
      lines.push(`    - [${warn.category}] ${warn.variable}: ${warn.message}`)
    })
  }

  return lines.join("\n")
}
