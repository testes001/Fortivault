import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

/**
 * Redundant environment variable validation in middleware
 * Provides additional safety checks during request processing
 */
function isTruthy(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0
}

function validateEnvVars(): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Critical variables
  if (!isTruthy(process.env.WEB3FORMS_API_KEY)) {
    errors.push("WEB3FORMS_API_KEY")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export async function middleware(request: NextRequest) {
  // Check if this is a form submission API route that requires configuration
  const pathname = request.nextUrl.pathname
  const isFormRoute = pathname.startsWith("/api/submit/") || pathname.startsWith("/api/contact")

  if (isFormRoute) {
    const validation = validateEnvVars()

    if (!validation.isValid) {
      console.error("[Middleware] Form submission route accessed with missing configuration:", validation.errors)

      // Return error response for API routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Server configuration incomplete. Please try again later.",
            code: "CONFIG_ERROR",
          },
          { status: 503 }
        )
      }

      // Return error page for non-API routes
      return NextResponse.json(
        {
          error: "Service Unavailable",
          message: "Server is not properly configured",
        },
        { status: 503 }
      )
    }

    // CSRF Protection: Verify requests come from same origin
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    const requestUrl = new URL(request.url)
    const allowedOrigin = requestUrl.origin

    // Allow requests from same origin or with valid referer
    if (request.method === "POST") {
      if (origin && origin !== allowedOrigin) {
        console.warn("[Middleware] CSRF protection: Cross-origin POST blocked", {
          origin,
          allowedOrigin,
          pathname,
        })
        return NextResponse.json(
          {
            success: false,
            message: "Request rejected for security reasons.",
            code: "CSRF_ERROR",
          },
          { status: 403 }
        )
      }

      if (referer && !referer.startsWith(allowedOrigin)) {
        console.warn("[Middleware] CSRF protection: Invalid referer", {
          referer,
          allowedOrigin,
          pathname,
        })
        return NextResponse.json(
          {
            success: false,
            message: "Request rejected for security reasons.",
            code: "CSRF_ERROR",
          },
          { status: 403 }
        )
      }
    }
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

  return response
}

export const config = {
  matcher: [
    "/((?!_next/|_vercel/|favicon.ico|.*\\..*).*)",
  ],
}
