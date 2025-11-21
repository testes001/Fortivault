"use client"

import { useState, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
    const [submissionError, setSubmissionError] = useState("")

    // Client-side validation for required fields
    const validateForm = () => {
      if (!data.fullName) return "Full Name is required."
      if (!data.contactEmail) return "Email is required."
      if (!data.scamType) return "Scam Type is required."
      if (!data.amount || !data.currency) return "Amount and currency are required."
      if (!data.timeline) return "Timeline is required."
      if (!data.description) return "Description is required."
      if (data.transactionHashes.length === 0 && data.bankReferences.length === 0) return "At least one transaction hash or bank reference is required."
      return null
    }
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<WizardData>(initialData)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caseId, setCaseId] = useState("")

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        // Debug: Log access key and form data
        console.log('Web3Forms Access Key:', process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY)
        for (let pair of formData.entries()) {
          console.log(pair[0]+ ': ' + pair[1])
        }
    e.preventDefault()
    setSubmissionError("")
    const validationError = validateForm()
    if (validationError) {
      setSubmissionError(validationError)
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(true)
  // ...existing code...
  // Render error message if present
  // Place this in your JSX where appropriate (e.g., above the form)
  // {submissionError && <div className="text-red-500 mb-4">{submissionError}</div>}

    const generatedCaseId = `CSRU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    setCaseId(generatedCaseId)

    const formData = new FormData()

    // Web3Forms access key from environment variable
    formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '')

    // Email settings
    formData.append('subject', `New Fraud Report Submitted: ${generatedCaseId}`)
    formData.append('from_name', 'Fortivault Cybercure')
    formData.append('reply_to', data.contactEmail)
    formData.append('email_to', 'hybe.corp@zohomail.com, fortivaultcybercure@gmail.com')

    // Append form data
    formData.append('caseId', generatedCaseId)
    formData.append('fullName', data.fullName)
    formData.append('scamType', data.scamType)
    formData.append('amount', `${data.amount} ${data.currency}`)
    formData.append('timeline', data.timeline)
    formData.append('description', data.description)
    formData.append('contactEmail', data.contactEmail)
    formData.append('contactPhone', data.contactPhone)
    formData.append('transactionHashes', data.transactionHashes.join('\n'))
    formData.append('bankReferences', data.bankReferences.join('\n'))

    // Append file attachments
    data.evidenceFiles.forEach(file => {
      formData.append('attachment[]', file)
    })

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      console.log('Web3Forms API Response:', result)
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setSubmissionError(result.message || "Submission failed. Please try again later.")
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Web3Forms Fetch Error:', error)
      setSubmissionError("Network error. Please check your connection and try again.")
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
