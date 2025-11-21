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
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}

export const config = {
  matcher: [
    "/((?!_next/|_vercel/|favicon.ico|.*\\..*).*)",
  ],
}
