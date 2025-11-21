# Fortivault Configuration & Environment Setup

This document describes the environment configuration system and how to properly set up Fortivault for development and production.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Configuration Validation](#configuration-validation)
5. [Error Messages](#error-messages)
6. [Troubleshooting](#troubleshooting)
7. [Health Check Endpoint](#health-check-endpoint)

## Overview

Fortivault includes a comprehensive environment configuration validation system that:

- **Validates at startup**: Checks critical configuration before the server starts
- **Validates at runtime**: Each request to form submission APIs performs redundant checks
- **Validates in middleware**: Additional safety layer prevents misconfigured form submissions
- **Provides clear errors**: Detailed error messages help identify configuration issues
- **Logs diagnostics**: All validation results are logged for debugging

### Configuration Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Startup Validation (next.config.mjs)         │
│  - Runs before server initialization                     │
│  - Exits if critical variables are missing              │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Middleware Validation (middleware.ts)         │
│  - Runs on form submission requests                      │
│  - Returns 503 error if config is invalid               │
└─────────��───────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: API Route Validation (route.ts files)         │
│  - Redundant checks in each endpoint                     │
│  - Detailed error responses                              │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Development Setup

1. **Copy the example configuration**:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in required variables**:
   ```
   WEB3FORMS_API_KEY=your_actual_api_key
   ```

3. **Add optional email configuration** (recommended):
   ```
   # Option A: Resend
   RESEND_API_KEY=your_resend_key
   RESEND_FROM_EMAIL=noreply@fortivault.com
   
   # OR Option B: SMTP
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=noreply@fortivault.com
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Check the startup output**:
   - If configuration is valid, you'll see: `✓ Fortivault initialized with the following services: ...`
   - If there are issues, you'll see detailed error messages

### Production Setup

Set environment variables through your hosting platform:

- **Netlify**: Settings → Build & Deploy → Environment
- **Vercel**: Project Settings → Environment Variables
- **Docker**: Use `--env` flags or environment files
- **Traditional hosting**: Use your provider's environment configuration

## Environment Variables

### Critical (Required)

| Variable | Purpose | Example | Documentation |
|----------|---------|---------|---|
| `WEB3FORMS_API_KEY` | API key for form submissions (contact & fraud reports) | `abc123xyz` | [Web3Forms](https://web3forms.com) |

### Email Service (Optional but Recommended)

Choose **ONE** email service:

#### Option A: Resend
| Variable | Purpose | Example |
|----------|---------|---------|
| `RESEND_API_KEY` | API key for email sending | `re_abc123...` |
| `RESEND_FROM_EMAIL` | Sender email address | `noreply@fortivault.com` |

#### Option B: SMTP
| Variable | Purpose | Example |
|----------|---------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your_email@gmail.com` |
| `SMTP_PASS` | SMTP password | `your_app_password` |
| `SMTP_FROM` | Sender email address | `noreply@fortivault.com` |
| `EMAIL_FROM` | Fallback sender (if SMTP_FROM not set) | `noreply@fortivault.com` |

### Public / Non-Sensitive (Optional)

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_FORMSPREE_URL` | Formspree endpoint | `https://formspree.io/f/xyzabc` |

## Configuration Validation

### Startup Validation

When the development server starts, it validates all environment variables:

**Example: Startup with valid configuration**
```
✓ Fortivault initialized with the following services: forms, email
```

**Example: Startup with missing critical variable**
```
════════════════════════════════════════════════════════════════════════════════
  CRITICAL: Missing Environment Variables
════════════════════════════════════════════════════════════════════════════════

  ✗ WEB3FORMS_API_KEY - Required for contact and fraud report forms

Please set the missing environment variables before starting the server.
════════════════════════════════════════════════════════════════════════════════
```

**Example: Startup with warnings**
```
════════════════════════════════════════════════════════════════════════════════
  WARNINGS: Environment Configuration
════════════════════════════════════════════════════════════════════════════════

  ⚠ No email service configured. Set RESEND_API_KEY or SMTP_* variables...
  ⚠ Incomplete SMTP configuration. Missing: SMTP_HOST, SMTP_USER...

═══════════════════════════════════════════════════════════════════════���════════
```

### Runtime Validation

Each form submission request performs redundant validation:

1. **Middleware check**: Validates config before route handler
2. **Route handler check**: Double-checks before API calls
3. **Error handling**: Provides specific error messages for each failure

## Error Messages

### Improved Error Messages

The system provides clear, actionable error messages for common issues:

#### Configuration Errors
- **Missing API Key**: "WEB3FORMS_API_KEY is not configured. Contact support if this persists."
- **Empty API Key**: "WEB3FORMS_API_KEY is empty. Please provide a valid API key."

#### Validation Errors
- **Invalid JSON**: "Invalid request format. Please ensure you are sending valid JSON."
- **Missing Fields**: Lists which required fields are missing from the request
- **Invalid Email**: "Please provide a valid email address"

#### Service Errors
- **Service Timeout**: "Unable to process your submission at this time. Please try again in a few moments."
- **Service Unavailable** (5xx): "The submission service is temporarily unavailable. Please try again in a few moments."
- **Rate Limited** (429): "Too many submissions. Please wait a moment and try again."
- **Authentication Failed** (401/403): "Server authentication failed. Please contact support."

#### Internal Errors
- **Unexpected Error**: "An unexpected error occurred. Please try again later."
- Each error is logged with full stack trace for debugging

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": "Additional context if available",
  "errors": ["Field-specific errors if applicable"]
}
```

## Troubleshooting

### Server Won't Start

**Problem**: `CRITICAL: Missing Environment Variables`

**Solution**:
1. Check `.env.local` exists (should be copied from `.env.example`)
2. Verify `WEB3FORMS_API_KEY` is set with a non-empty value
3. Review the error message for which variables are missing
4. Restart the server after making changes

### Form Submissions Failing

**Problem**: Getting "Server configuration error" when submitting forms

**Solution**:
1. Check the server startup logs for configuration warnings
2. Visit `/api/env-health` endpoint in your browser
3. Verify all required environment variables are set
4. Check that API keys are not empty or contain only whitespace

### Email Not Working

**Problem**: Email sending fails or emails not received

**Solution**:
1. Check `/api/env-health` endpoint - email service should show as configured
2. If using Resend:
   - Verify both `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
   - Check that sender domain is verified in Resend dashboard
3. If using SMTP:
   - All SMTP variables must be set: HOST, PORT, USER, PASS, FROM
   - Test credentials with SMTP client tool first
   - Check firewall/network access to SMTP server
4. Review server logs for specific error messages

### Redundant Checks Failing

**Problem**: Configuration passes startup but fails at runtime

**Solution**:
1. This indicates environment variables are being cleared at runtime
2. Check hosting platform settings - variables may be reloaded
3. Verify variables are not being explicitly unset in code
4. Check process logs for any runtime variable changes

## Health Check Endpoint

### GET /api/env-health

Returns detailed configuration status and diagnostics.

**Example Response (200 OK)**:
```json
{
  "ok": true,
  "status": "Healthy",
  "timestamp": "2024-01-20T10:30:45Z",
  "summary": {
    "healthy": true,
    "hasWarnings": false,
    "criticalErrorCount": 0,
    "warningCount": 0
  },
  "details": {
    "forms": {
      "name": "Web3Forms",
      "configured": true,
      "severity": "critical",
      "status": "✓ Configured"
    },
    "email": {
      "name": "Email Services",
      "configured": true,
      "services": {
        "resend": {
          "configured": true,
          "status": "✓ Configured"
        }
      }
    }
  }
}
```

**Example Response (503 Service Unavailable)**:
```json
{
  "ok": false,
  "status": "Configuration issues detected",
  "summary": {
    "criticalErrorCount": 1,
    "critical": ["WEB3FORMS_API_KEY is missing"]
  }
}
```

### Using Health Check in Monitoring

```bash
# Check configuration status
curl http://localhost:3000/api/env-health

# In CI/CD pipeline
STATUS=$(curl -s http://localhost:3000/api/env-health | jq -r '.ok')
if [ "$STATUS" != "true" ]; then
  echo "Configuration validation failed"
  exit 1
fi
```

## Best Practices

1. **Always start with .env.example**: Copy it to `.env.local` and fill in values
2. **Never commit .env.local**: Add it to `.gitignore`
3. **Use platform-specific environment setup in production**: Don't rely on `.env` files
4. **Check `/api/env-health` on new deployments**: Verify configuration is correct
5. **Review startup logs**: Look for warnings about optional but recommended configurations
6. **Rotate API keys periodically**: For security best practices
7. **Use different keys for different environments**: Dev, staging, and production
8. **Document your setup**: Share .env.example with team members

## Additional Resources

- [Environment Variable Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Web3Forms Documentation](https://web3forms.com/documentation)
- [Resend Email Service](https://resend.com)
- [Node.js SMTP Configuration](https://nodemailer.com/)
- [Builder.io Projects Documentation](https://www.builder.io/c/docs/projects)

## Support

If you encounter configuration issues:

1. Check `/api/env-health` endpoint for detailed diagnostics
2. Review this documentation and the .env.example file
3. Check server startup logs in console
4. Review API response error codes and messages
5. Contact support with the output from `/api/env-health`
