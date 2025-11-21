"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface TransactionStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

const isValidTransactionHash = (hash: string): boolean => {
  const cleaned = hash.trim()
  return /^[a-fA-F0-9]{64}$/.test(cleaned)
}

const isValidBankReference = (reference: string): boolean => {
  const cleaned = reference.trim()
  return cleaned.length >= 5 && /^[a-zA-Z0-9\-\/\s]+$/.test(cleaned)
}

export function TransactionStep({ data, updateData }: TransactionStepProps) {
  const [newHash, setNewHash] = useState("")
  const [newReference, setNewReference] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addTransactionHash = () => {
    const cleaned = newHash.trim()

    if (!cleaned) {
      setErrors({ hash: "Transaction hash cannot be empty" })
      return
    }

    if (!isValidTransactionHash(cleaned)) {
      setErrors({ hash: "Invalid hash format. Expected 64 hexadecimal characters" })
      return
    }

    if (data.transactionHashes.includes(cleaned)) {
      setErrors({ hash: "This transaction hash has already been added" })
      return
    }

    updateData({
      transactionHashes: [...data.transactionHashes, cleaned],
    })
    setNewHash("")
    setErrors({})
  }

  const removeTransactionHash = (index: number) => {
    updateData({
      transactionHashes: data.transactionHashes.filter((_, i) => i !== index),
    })
    setErrors({})
  }

  const addBankReference = () => {
    const cleaned = newReference.trim()

    if (!cleaned) {
      setErrors({ reference: "Bank reference cannot be empty" })
      return
    }

    if (!isValidBankReference(cleaned)) {
      setErrors({ reference: "Invalid format. Use letters, numbers, hyphens, and spaces (minimum 5 characters)" })
      return
    }

    if (data.bankReferences.includes(cleaned)) {
      setErrors({ reference: "This bank reference has already been added" })
      return
    }

    updateData({
      bankReferences: [...data.bankReferences, cleaned],
    })
    setNewReference("")
    setErrors({})
  }

  const removeBankReference = (index: number) => {
    updateData({
      bankReferences: data.bankReferences.filter((_, i) => i !== index),
    })
    setErrors({})
  }

  if (data.scamType === "crypto") {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4" id="crypto-heading">
            Cryptocurrency Transaction Information <span className="text-gray-400 text-sm">(Optional)</span>
          </h3>
          <p className="text-muted-foreground mb-4">
            If available, provide any transaction hashes (TXIDs) related to the fraudulent transfers.
          </p>
        </div>

        {errors.hash && (
          <Alert variant="destructive" role="alert">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.hash}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter transaction hash (TXID)"
              value={newHash}
              onChange={(e) => {
                setNewHash(e.target.value)
                if (errors.hash) setErrors({})
              }}
              onKeyPress={(e) => e.key === "Enter" && addTransactionHash()}
              aria-labelledby="crypto-heading"
              aria-describedby={errors.hash ? "crypto-error" : "crypto-hint"}
              className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
            />
            <Button
              onClick={addTransactionHash}
              disabled={!newHash.trim()}
              aria-label="Add transaction hash"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
          {errors.hash ? (
            <p id="crypto-error" className="text-xs text-red-500" role="alert">
              {errors.hash}
            </p>
          ) : (
            <p id="crypto-hint" className="text-xs text-muted-foreground">
              Press Enter or click Add to include a transaction hash (64 hex characters)
            </p>
          )}

          {data.transactionHashes.length > 0 && (
            <div className="space-y-2">
              <Label className="font-medium">
                Transaction Hashes <span className="text-primary">({data.transactionHashes.length})</span>
              </Label>
              <div className="flex flex-wrap gap-2" role="list">
                {data.transactionHashes.map((hash, index) => (
                  <div key={index} role="listitem" className="relative group">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-2 pr-0 pl-4 py-2 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-all"
                      title={hash}
                    >
                      <span className="font-mono text-xs">{hash.slice(0, 16)}...</span>
                      <button
                        onClick={() => removeTransactionHash(index)}
                        className="hover:text-destructive focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-destructive rounded px-1 transition-all"
                        aria-label={`Remove transaction hash ${hash}`}
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" id="bank-heading">
          Bank Transfer Information
        </h3>
        <p className="text-muted-foreground mb-4">
          Please provide any bank transfer references, wire transfer numbers, or payment confirmation numbers.
        </p>
      </div>

      {errors.reference && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.reference}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter reference number"
            value={newReference}
            onChange={(e) => {
              setNewReference(e.target.value)
              if (errors.reference) setErrors({})
            }}
            onKeyPress={(e) => e.key === "Enter" && addBankReference()}
            aria-labelledby="bank-heading"
            aria-describedby={errors.reference ? "bank-error" : "bank-hint"}
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          />
          <Button
            onClick={addBankReference}
            disabled={!newReference.trim()}
            aria-label="Add bank reference"
            className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
        {errors.reference ? (
          <p id="bank-error" className="text-xs text-red-500" role="alert">
            {errors.reference}
          </p>
        ) : (
          <p id="bank-hint" className="text-xs text-muted-foreground">
            Press Enter or click Add to include a reference number
          </p>
        )}

        {data.bankReferences.length > 0 && (
          <div className="space-y-2">
            <Label className="font-medium">
              Bank References <span className="text-primary">({data.bankReferences.length})</span>
            </Label>
            <div className="flex flex-wrap gap-2" role="list">
              {data.bankReferences.map((ref, index) => (
                <div key={index} role="listitem" className="relative group">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 pr-0 pl-4 py-2 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary transition-all"
                    title={ref}
                  >
                    <span className="truncate max-w-xs">{ref}</span>
                    <button
                      onClick={() => removeBankReference(index)}
                      className="hover:text-destructive focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-destructive rounded px-1 transition-all"
                      aria-label={`Remove reference ${ref}`}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
