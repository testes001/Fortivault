"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { validateEmail, validatePhone } from "@/lib/utils/validation"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface PersonalDetailsStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  showError?: boolean
}

export function PersonalDetailsStep({ data, updateData, showError = false }: PersonalDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNameChange = (value: string) => {
    updateData({ fullName: value })
    if (errors.fullName && value.trim().length > 0) {
      setErrors({ ...errors, fullName: "" })
    }
  }

  const handleEmailChange = (value: string) => {
    updateData({ contactEmail: value })

    if (value && !validateEmail(value)) {
      setErrors({ ...errors, contactEmail: "Please enter a valid email address" })
    } else {
      setErrors({ ...errors, contactEmail: "" })
    }
  }

  const handleEmailBlur = (value: string) => {
    if (value && !validateEmail(value)) {
      setErrors({ ...errors, contactEmail: "Please enter a valid email address" })
    }
  }

  const handlePhoneChange = (value: string) => {
    updateData({ contactPhone: value })

    if (value.trim().length > 0 && !validatePhone(value)) {
      setErrors({ ...errors, contactPhone: "Invalid phone format. Must be at least 10 digits" })
    } else {
      setErrors({ ...errors, contactPhone: "" })
    }
  }

  const handlePhoneBlur = (value: string) => {
    if (value.trim().length > 0 && !validatePhone(value)) {
      setErrors({ ...errors, contactPhone: "Invalid phone format. Must be at least 10 digits" })
    }
  }

  return (
    <div className="space-y-6">
      {showError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all required fields (Name and Email)
          </AlertDescription>
        </Alert>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-4" id="personal-details-heading">
          Your Details
        </h3>
        <p className="text-muted-foreground mb-4">
          Please provide your contact information so we can follow up with you.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="font-medium">
            Full Name <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => handleNameChange(e.target.value)}
            aria-labelledby="fullName"
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            aria-required="true"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
            required
          />
          {errors.fullName && (
            <p id="fullName-error" className="text-sm text-red-500" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="font-medium">
            Email Address <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="you@example.com"
            value={data.contactEmail}
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={(e) => handleEmailBlur(e.target.value)}
            aria-labelledby="contactEmail"
            aria-describedby={errors.contactEmail ? "contactEmail-error" : "contactEmail-hint"}
            aria-required="true"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
            required
          />
          {errors.contactEmail && (
            <p id="contactEmail-error" className="text-sm text-red-500" role="alert">
              {errors.contactEmail}
            </p>
          )}
          {!errors.contactEmail && (
            <p id="contactEmail-hint" className="text-xs text-muted-foreground">
              We'll use this to send you updates about your case
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone" className="font-medium">
            Phone Number <span className="text-gray-400 text-sm">(Optional)</span>
          </Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={data.contactPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={(e) => handlePhoneBlur(e.target.value)}
            aria-labelledby="contactPhone"
            aria-describedby={errors.contactPhone ? "contactPhone-error" : "contactPhone-hint"}
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          />
          {errors.contactPhone && (
            <p id="contactPhone-error" className="text-sm text-red-500" role="alert">
              {errors.contactPhone}
            </p>
          )}
          {!errors.contactPhone && (
            <p id="contactPhone-hint" className="text-xs text-muted-foreground">
              Must be a valid phone number (10+ digits)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
