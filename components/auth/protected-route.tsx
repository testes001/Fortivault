"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "user" | "reviewer"
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/login" }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (requiredRole && user && (user as any).role && (user as any).role !== requiredRole) {
        const dashboardPath = (user as any).role === "reviewer" ? "/reviewer" : "/dashboard"
        router.push(dashboardPath)
        return
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || (requiredRole && (user as any).role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
