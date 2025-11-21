"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File as FileIcon, X, AlertCircle } from "lucide-react"
import { validateFileSize, validateFileType, getFileSizeDisplay } from "@/lib/utils/validation"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface EvidenceStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE_MB = 10
const MAX_TOTAL_SIZE_MB = 50

export function EvidenceStep({ data, updateData }: EvidenceStepProps) {
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [uploadInProgress, setUploadInProgress] = useState(false)

  const getTotalFileSize = () => {
    return data.evidenceFiles.reduce((sum, file) => sum + file.size, 0)
  }

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(event.target.files || [])
      const errors: string[] = []

      if (newFiles.length === 0) {
        return
      }

      // Validate each file
      for (const file of newFiles) {
        if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
          errors.push(
            `"${file.name}" exceeds maximum file size of ${MAX_FILE_SIZE_MB}MB (actual: ${getFileSizeDisplay(file.size)})`,
          )
          continue
        }

        if (!validateFileType(file, ALLOWED_MIME_TYPES)) {
          errors.push(`"${file.name}" has an unsupported file type. Allowed: JPG, PNG, PDF, TXT, DOC, DOCX`)
          continue
        }
      }

      // Check total size
      const validFiles = newFiles.filter(
        (file) =>
          validateFileSize(file, MAX_FILE_SIZE_MB) && validateFileType(file, ALLOWED_MIME_TYPES),
      )

      const totalSize = getTotalFileSize() + validFiles.reduce((sum, file) => sum + file.size, 0)
      if (totalSize > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
        errors.push(
          `Total file size (${getFileSizeDisplay(totalSize)}) exceeds maximum of ${MAX_TOTAL_SIZE_MB}MB`,
        )
      }

      if (errors.length > 0) {
        setFileErrors(errors)
        return
      }

      if (validFiles.length > 0) {
        setUploadInProgress(true)
        setTimeout(() => {
          const updatedFiles = [...data.evidenceFiles, ...validFiles]
          updateData({ evidenceFiles: updatedFiles })
          setUploadInProgress(false)
          setFileErrors([])
        }, 500)
      }
    },
    [data.evidenceFiles, updateData],
  )

  const removeFile = (indexToRemove: number) => {
    const newFiles = data.evidenceFiles.filter((_, index) => index !== indexToRemove)
    updateData({
      evidenceFiles: newFiles,
    })

    if (newFiles.length === 0) {
      setFileErrors([])
    }
  }

  const totalSize = getTotalFileSize()
  const totalSizeDisplay = getFileSizeDisplay(totalSize)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" id="evidence-heading">
          Upload Evidence
        </h3>
        <p className="text-muted-foreground mb-4">
          Upload any supporting evidence such as screenshots, emails, chat logs, receipts, or other relevant documents.
        </p>
      </div>

      {fileErrors.length > 0 && (
        <Alert variant="destructive" role="alert" aria-labelledby="file-errors">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription id="file-errors">
            <ul className="list-disc list-inside space-y-1">
              {fileErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-dashed border-2 border-muted-foreground/25 focus-within:ring-2 focus-within:ring-primary transition-all">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" aria-hidden="true" />
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer font-medium">
                <Button
                  variant="outline"
                  asChild
                  disabled={uploadInProgress}
                  className="focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                >
                  <span>{uploadInProgress ? "Uploading..." : "Choose Files"}</span>
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                aria-labelledby="evidence-heading"
                aria-describedby="file-requirements"
                disabled={uploadInProgress}
                className="hidden"
              />
            </div>
            <p id="file-requirements" className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, PDF, TXT, DOC, DOCX
              <br />
              Max {MAX_FILE_SIZE_MB}MB per file, {MAX_TOTAL_SIZE_MB}MB total
            </p>
          </div>
        </CardContent>
      </Card>

      {data.evidenceFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">
              Uploaded Files <span className="text-primary">({data.evidenceFiles.length})</span>
            </Label>
            <span className="text-sm text-muted-foreground" aria-live="polite">
              Total: {totalSizeDisplay} / {MAX_TOTAL_SIZE_MB}MB
            </span>
          </div>
          <div className="space-y-2" role="list">
            {data.evidenceFiles.map((file, index) => (
              <Card key={index} role="listitem">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <FileIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{getFileSizeDisplay(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove file ${file.name}`}
                      className="flex-shrink-0 focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
