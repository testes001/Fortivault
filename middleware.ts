import type { NextRequest } from "next/server"

import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
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
