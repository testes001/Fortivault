"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface ConfirmationStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

export function ConfirmationStep({ data, updateData }: ConfirmationStepProps) {
  const getScamTypeLabel = (type: string) => {
    switch (type) {
      case "crypto":
        return "Cryptocurrency Fraud"
      case "fiat":
        return "Traditional Financial Fraud"
      case "other":
        return "Other Fraud Types"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" id="confirmation-heading">
          Review Your Submission
        </h3>
        <p className="text-muted-foreground mb-6">
          Please review all the information you have provided before submitting your report.
        </p>
      </div>

      <Card role="region" aria-labelledby="case-summary-title">
        <CardHeader>
          <CardTitle className="text-lg" id="case-summary-title">
            Case Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Full Name</Label>
              <p className="text-sm">{data.fullName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email Address</Label>
              <p className="text-sm">{data.contactEmail}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone Number</Label>
              <p className="text-sm">{data.contactPhone || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Scam Type</Label>
              <p className="text-sm">{getScamTypeLabel(data.scamType)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Amount Lost</Label>
              <p className="text-sm">
                {data.amount} {data.currency}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Timeline</Label>
              <p className="text-sm">{data.timeline}</p>
            </div>
          </div>

          {data.transactionHashes.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Transaction Hashes</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.transactionHashes.map((hash, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {hash.slice(0, 8)}...
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.bankReferences.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Bank References</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {data.bankReferences.map((ref, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{data.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
