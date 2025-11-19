"use client"

import type React from "react"

import { useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ImageIcon, X } from "lucide-react"
import type { WizardData } from "@/components/fraud-reporting-wizard"

interface EvidenceStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

export function EvidenceStep({ data, updateData }: EvidenceStepProps) {
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
      const uploadedUrls = [...data.evidenceFileUrls]

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        try {
          const response = await fetch("https://file.io", {
            method: "POST",
            body: formData,
          })
          const result = await response.json()
          if (result.success) {
            uploadedUrls.push(result.link)
          }
        } catch (error) {
          console.error("File upload error:", error)
        }
      }

      updateData({ evidenceFileUrls: uploadedUrls })
    },
    [data.evidenceFileUrls, updateData],
  )

  const removeFile = (index: number) => {
    updateData({
      evidenceFileUrls: data.evidenceFileUrls.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Upload Evidence</h3>
        <p className="text-muted-foreground mb-4">
          Upload any supporting evidence such as screenshots, emails, chat logs, receipts, or other relevant documents.
        </p>
      </div>

      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Choose Files</span>
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, PDF, TXT, DOC, DOCX (Max 10MB per file)
            </p>
          </div>
        </CardContent>
      </Card>

      {data.evidenceFileUrls.length > 0 && (
        <div className="space-y-4">
          <Label>Uploaded File Links ({data.evidenceFileUrls.length}):</Label>
          <div className="space-y-2">
            {data.evidenceFileUrls.map((url, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-4 h-4" />
                      <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium truncate">
                        {url}
                      </a>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
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
