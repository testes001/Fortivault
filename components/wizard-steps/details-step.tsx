"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface DetailsStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "other", label: "Other" },
]

const timeframes = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this-week", label: "This week" },
  { value: "last-week", label: "Last week" },
  { value: "this-month", label: "This month" },
  { value: "1-3-months", label: "1-3 months ago" },
  { value: "3-6-months", label: "3-6 months ago" },
  { value: "6-months-plus", label: "More than 6 months ago" },
]

export function DetailsStep({ data, updateData }: DetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAmountChange = (value: string) => {
    const num = parseFloat(value)

    if (value === "") {
      updateData({ amount: value })
      setErrors({ ...errors, amount: "" })
    } else if (isNaN(num) || num <= 0) {
      setErrors({ ...errors, amount: "Amount must be greater than 0" })
    } else {
      updateData({ amount: value })
      setErrors({ ...errors, amount: "" })
    }
  }

  const handleAmountBlur = (value: string) => {
    if (value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
      setErrors({ ...errors, amount: "Amount must be greater than 0" })
    }
  }

  const handleCurrencyChange = (value: string) => {
    updateData({ currency: value })
    if (errors.currency) {
      setErrors({ ...errors, currency: "" })
    }
  }

  const handleTimelineChange = (value: string) => {
    updateData({ timeline: value })
    if (errors.timeline) {
      setErrors({ ...errors, timeline: "" })
    }
  }

  const handleDescriptionChange = (value: string) => {
    updateData({ description: value })
    if (errors.description && value.trim().length > 0) {
      setErrors({ ...errors, description: "" })
    }
  }

  const handleDescriptionBlur = (value: string) => {
    if (!value.trim()) {
      setErrors({ ...errors, description: "Description is required" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="amount" className="font-medium">
            Amount Lost <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            value={data.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={(e) => handleAmountBlur(e.target.value)}
            aria-labelledby="amount"
            aria-describedby={errors.amount ? "amount-error" : "amount-hint"}
            aria-required="true"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          />
          {errors.amount && (
            <p id="amount-error" className="text-sm text-red-500" role="alert">
              {errors.amount}
            </p>
          )}
          {!errors.amount && (
            <p id="amount-hint" className="text-xs text-muted-foreground">
              Enter the amount greater than 0
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="font-medium">
            Currency <span className="text-red-500" aria-label="required">*</span>
          </Label>
          <Select value={data.currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger
              id="currency"
              aria-labelledby="currency"
              aria-describedby={errors.currency ? "currency-error" : undefined}
              aria-required="true"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
            >
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.currency && (
            <p id="currency-error" className="text-sm text-red-500" role="alert">
              {errors.currency}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timeline" className="font-medium">
          When did this occur? <span className="text-red-500" aria-label="required">*</span>
        </Label>
        <Select value={data.timeline} onValueChange={handleTimelineChange}>
          <SelectTrigger
            id="timeline"
            aria-labelledby="timeline"
            aria-describedby={errors.timeline ? "timeline-error" : undefined}
            aria-required="true"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((timeframe) => (
              <SelectItem key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timeline && (
          <p id="timeline-error" className="text-sm text-red-500" role="alert">
            {errors.timeline}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-medium">
          Detailed Description <span className="text-red-500" aria-label="required">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Please provide a detailed description of what happened, including how you were contacted, what you were promised, and how the fraud occurred..."
          className="min-h-[120px] focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          value={data.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          onBlur={(e) => handleDescriptionBlur(e.target.value)}
          aria-labelledby="description"
          aria-describedby={errors.description ? "description-error" : "description-hint"}
          aria-required="true"
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-500" role="alert">
            {errors.description}
          </p>
        )}
        {!errors.description && (
          <p id="description-hint" className="text-sm text-muted-foreground">
            Include as much detail as possible. This helps our team understand your case better.
          </p>
        )}
      </div>
    </div>
  )
}
