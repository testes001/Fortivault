"use client"

import { useState, FormEvent, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { ScamTypeStep } from "@/components/wizard-steps/scam-type-step"
import { PersonalDetailsStep } from "@/components/wizard-steps/personal-details-step"
import { DetailsStep } from "@/components/wizard-steps/details-step"
import { TransactionStep } from "@/components/wizard-steps/transaction-step"
import { EvidenceStep } from "@/components/wizard-steps/evidence-step"
import { ConfirmationStep } from "@/components/wizard-steps/confirmation-step"
import { SuccessStep } from "@/components/wizard-steps/success-step"

export interface WizardData {
  fullName: string
  scamType: string
  amount: string
  currency: string
  timeline: string
  description: string
  transactionHashes: string[]
  bankReferences: string[]
  evidenceFiles: File[]
  contactEmail: string
  contactPhone: string
}

const initialData: WizardData = {
  fullName: "",
  scamType: "",
  amount: "",
  currency: "",
  timeline: "",
  description: "",
  transactionHashes: [],
  bankReferences: [],
  evidenceFiles: [],
  contactEmail: "",
  contactPhone: "",
}

const steps = [
  { title: "Scam Type", description: "Select the type of fraud" },
  { title: "Personal Details", description: "Provide your contact information" },
  { title: "Details", description: "Provide incident details" },
  { title: "Transactions", description: "Add transaction references" },
  { title: "Evidence", description: "Upload supporting files" },
  { title: "Confirm", description: "Review and submit" },
]

export function FraudReportingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<WizardData>(initialData)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState("")
  const [caseId, setCaseId] = useState("")
  const [showStepError, setShowStepError] = useState(false)

  // Warn user before leaving with incomplete data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if form has data but is incomplete (not submitted and not on step 0)
      const hasData = Object.values(data).some((v) => {
        if (Array.isArray(v)) return v.length > 0
        return v !== ""
      })

      if (hasData && !isSubmitted && currentStep !== 0) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [data, isSubmitted, currentStep])

  const validateForm = () => {
    if (!data.fullName) return "Full Name is required."
    if (!data.contactEmail) return "Email is required."
    if (!data.scamType) return "Scam Type is required."
    if (!data.amount || !data.currency) return "Amount and currency are required."
    if (!data.timeline) return "Timeline is required."
    if (!data.description) return "Description is required."
    if (data.transactionHashes.length === 0 && data.bankReferences.length === 0)
      return "At least one transaction hash or bank reference is required."
    return null
  }

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (!canProceed()) {
      setShowStepError(true)
      return
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setShowStepError(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmissionError("")

    const validationError = validateForm()
    if (validationError) {
      setSubmissionError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData to handle file uploads
      const formData = new FormData()

      // Add form fields
      formData.append("fullName", data.fullName)
      formData.append("contactEmail", data.contactEmail)
      formData.append("contactPhone", data.contactPhone)
      formData.append("scamType", data.scamType)
      formData.append("amount", data.amount)
      formData.append("currency", data.currency)
      formData.append("timeline", data.timeline)
      formData.append("description", data.description)

      // Add arrays as JSON strings
      formData.append("transactionHashes", JSON.stringify(data.transactionHashes))
      formData.append("bankReferences", JSON.stringify(data.bankReferences))

      // Add file attachments
      data.evidenceFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/report", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - browser will set it with correct boundary
      })

      const result = await response.json()

      if (result.success && result.caseId) {
        setCaseId(result.caseId)
        setIsSubmitted(true)
      } else {
        const errorMessage =
          Array.isArray(result.errors) && result.errors.length > 0
            ? result.errors[0]
            : result.error || "Submission failed. Please check your information and try again."
        setSubmissionError(errorMessage)
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Submission error:", error)
      const errorMsg = error instanceof Error ? error.message : "Network error"
      setSubmissionError(`${errorMsg}. Please check your connection and try again.`)
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return data.scamType !== ""
      case 1:
        return data.fullName !== "" && data.contactEmail !== ""
      case 2:
        return data.amount && data.currency && data.timeline && data.description
      case 3:
        return data.transactionHashes.length > 0 || data.bankReferences.length > 0
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  if (isSubmitted) {
    return <SuccessStep caseId={caseId} userEmail={data.contactEmail} />
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </CardTitle>
              <div className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</div>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {submissionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submissionError}</AlertDescription>
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && <ScamTypeStep data={data} updateData={updateData} />}
              {currentStep === 1 && <PersonalDetailsStep data={data} updateData={updateData} />}
              {currentStep === 2 && <DetailsStep data={data} updateData={updateData} />}
              {currentStep === 3 && <TransactionStep data={data} updateData={updateData} />}
              {currentStep === 4 && <EvidenceStep data={data} updateData={updateData} />}
              {currentStep === 5 && <ConfirmationStep data={data} updateData={updateData} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button type="submit" disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            ) : (
              <Button type="button" onClick={nextStep} disabled={!canProceed()}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
