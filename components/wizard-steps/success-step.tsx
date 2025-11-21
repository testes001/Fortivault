"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface SuccessStepProps {
  caseId: string
  userEmail: string
}

export function SuccessStep({ caseId, userEmail }: SuccessStepProps) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const progressMessages = [
      "Verifying report details...",
      "Validating evidence...",
      "Securing case data...",
      "Finalizing submission...",
    ]

    progressMessages.forEach((_, index) => {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, index])
      }, (index + 1) * 1000)

      return () => clearTimeout(timer)
    })

    const finalTimer = setTimeout(() => {
      setIsProcessing(false)
    }, 5000)

    return () => clearTimeout(finalTimer)
  }, [])

  if (isProcessing) {
    const progressMessages = [
      "Verifying report details...",
      "Validating evidence...",
      "Securing case data...",
      "Finalizing submission...",
    ]

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card className="text-center">
          <CardContent className="p-8 space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto"
            >
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"></div>
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Processing Your Report</h2>
              <p className="text-muted-foreground">Please wait while we securely process your fraud report...</p>

              <div className="space-y-3 mt-6">
                {progressMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: completedSteps.includes(index) ? 1 : 0.4,
                      x: 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-3 justify-start ${
                      completedSteps.includes(index) ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {completedSteps.includes(index) ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 rounded-full bg-primary/30 flex-shrink-0"
                      />
                    )}
                    <span className="text-sm">{message}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="text-center" role="region" aria-labelledby="success-title">
        <CardContent className="p-8 space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 mx-auto text-accent" />
          </motion.div>

          <div className="space-y-4">
            <h2 id="success-title" className="text-2xl font-bold text-accent">
              Report Submitted Successfully!
            </h2>
            <p className="text-muted-foreground text-pretty">
              Your fraud report has been securely received and is now in our system for processing.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Your Case Reference Number:</p>
            <p className="text-lg font-mono font-bold text-primary">{caseId}</p>
            <p className="text-xs text-muted-foreground mt-2">Please save this for your records</p>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-primary mb-2">Confirmation Email Sent</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to <strong>{userEmail}</strong> with your case reference number and next steps.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-left">
            <p className="text-sm font-medium text-accent mb-2">What happens next?</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your case will be reviewed by our specialists</li>
              <li>• You'll receive updates via email</li>
              <li>• Additional information may be requested as needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
