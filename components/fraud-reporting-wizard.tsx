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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Generate case ID for user display
    const generatedCaseId = `CSRU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    setCaseId(generatedCaseId)
    
    // Update hidden form fields with current data before submission
    const form = e.currentTarget
    const hiddenFields = form.querySelectorAll('input[type="hidden"]')
    
    hiddenFields.forEach((field: any) => {
      switch (field.name) {
        case 'fullName':
          field.value = data.fullName
          break
        case 'scamType':
          field.value = data.scamType
          break
        case 'amount':
          field.value = data.amount
          break
        case 'currency':
          field.value = data.currency
          break
        case 'timeline':
          field.value = data.timeline
          break
        case 'description':
          field.value = data.description
          break
        case 'contactEmail':
          field.value = data.contactEmail
          break
        case 'contactPhone':
          field.value = data.contactPhone
          break
        case 'transactionHashes':
          field.value = data.transactionHashes.join(', ')
          break
        case 'bankReferences':
          field.value = data.bankReferences.join(', ')
          break
        case 'evidenceFileCount':
          field.value = data.evidenceFiles.length.toString()
          break
        case 'evidenceFileNames':
          field.value = data.evidenceFiles.map(f => f.name).join(', ')
          break
      }
    })
    
    // Submit form naturally to Netlify
    const formData = new FormData(form)
    
    fetch('/', {
      method: 'POST',
      body: formData
    })
    .then(() => {
      // Show success state
      setIsSubmitted(true)
    })
    .catch((error) => {
      console.error('Form submission error:', error)
      setIsSubmitting(false)
      // You could add error handling here
    })
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
    <form name="fraud-report" method="POST" data-netlify="true" onSubmit={handleSubmit} netlify-honeypot="bot-field">
      <input type="hidden" name="bot-field" />
      <input type="hidden" name="form-name" value="fraud-report" />
      
      {/* Hidden fields to capture all wizard data for Netlify Forms */}
      <input type="hidden" name="fullName" value={data.fullName} />
      <input type="hidden" name="scamType" value={data.scamType} />
      <input type="hidden" name="amount" value={data.amount} />
      <input type="hidden" name="currency" value={data.currency} />
      <input type="hidden" name="timeline" value={data.timeline} />
      <input type="hidden" name="description" value={data.description} />
      <input type="hidden" name="contactEmail" value={data.contactEmail} />
      <input type="hidden" name="contactPhone" value={data.contactPhone} />
      <input type="hidden" name="transactionHashes" value={data.transactionHashes.join(', ')} />
      <input type="hidden" name="bankReferences" value={data.bankReferences.join(', ')} />
      <input type="hidden" name="evidenceFileCount" value={data.evidenceFiles.length.toString()} />
      <input type="hidden" name="evidenceFileNames" value={data.evidenceFiles.map(f => f.name).join(', ')} />

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
