"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function PageTransitionLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")

      if (link && link.href) {
        const href = link.getAttribute("href")
        // Only show loader for internal navigation, not external links or anchors
        if (href && !href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("#")) {
          setIsLoading(true)
        }
      }
    }

    // Add click listener to document
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  // Hide loader after pathname changes (with minimum duration to ensure visibility)
  useEffect(() => {
    if (isLoading) {
      // Keep loader visible for at least 300ms for smooth UX
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [pathname, isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
        </div>
        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading page...</p>
          <p className="text-xs text-muted-foreground">Please wait</p>
        </div>
      </div>
    </div>
  )
}
