"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface PersonalDetailsStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

export function PersonalDetailsStep({ data, updateData }: PersonalDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Details</h3>
        <p className="text-muted-foreground mb-4">
          Please provide your contact information so we can follow up with you.
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email Address</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="you@example.com"
            value={data.contactEmail}
            onChange={(e) => updateData({ contactEmail: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
          <Input
            id="contactPhone"
            placeholder="+1 (555) 123-4567"
            value={data.contactPhone}
            onChange={(e) => updateData({ contactPhone: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
