"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bitcoin, CreditCard, AlertTriangle, AlertCircle } from "lucide-react"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface ScamTypeStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  showError?: boolean
}

const scamTypes = [
  {
    id: "crypto",
    title: "Cryptocurrency Fraud",
    description: "Bitcoin, Ethereum, or other digital currency scams",
    icon: Bitcoin,
  },
  {
    id: "fiat",
    title: "Traditional Financial Fraud",
    description: "Bank transfers, credit cards, or wire fraud",
    icon: CreditCard,
  },
  {
    id: "other",
    title: "Other Fraud Types",
    description: "Investment scams, romance scams, or other fraud",
    icon: AlertTriangle,
  },
]

export function ScamTypeStep({ data, updateData, showError = false }: ScamTypeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4" id="scam-type-heading">
          What type of fraud occurred?
        </h3>
        <p className="text-muted-foreground">
          {data.scamType ? "✓ You've selected a scam type" : "Please select the type of fraud that occurred"}
        </p>
      </div>
      {showError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a scam type to continue
          </AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="scam-type-heading">
        {scamTypes.map((type) => {
          const isSelected = data.scamType === type.id
          return (
            <button
              key={type.id}
              onClick={() => updateData({ scamType: type.id })}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${type.title}: ${type.description}`}
              className={`text-left transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-lg ${
                isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
              }`}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isSelected ? "border-primary" : ""
                }`}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center transition-all ${
                    isSelected ? "bg-primary/20" : "bg-accent/10"
                  }`}>
                    <type.icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-accent"}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className={`font-semibold mb-2 ${isSelected ? "text-primary" : ""}`}>
                      {type.title}
                      {isSelected && <span className="ml-2 text-sm font-normal">(Selected)</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty">{type.description}</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
