"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Phone, MapPin, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+14582983729"
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "fortivault@aol.com"
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fortivault.com"

export default function ContactPage() {
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    setFormSuccess(false)

    const form = event.currentTarget
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const subject = form.subject.value.trim()
    const message = form.message.value.trim()
    const phone = form.phone?.value?.trim() || ""

    if (!name || !email || !subject || !message) {
      setFormError("Please fill in all required fields (Name, Email, Subject, Message).")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          phone,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setFormSuccess(true)
        toast.success("Message sent successfully!")
        form.reset()
      } else {
        const errorMessage =
          Array.isArray(result.errors) && result.errors.length > 0
            ? result.errors[0]
            : result.error || "Submission failed. Please try again later."
        setFormError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setFormError("Network error. Please check your connection and try again.")
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Fortivault</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Get in touch with our fraud recovery specialists. We're here to help you reclaim your funds and secure
                your financial future.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    {formError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}

                    {formSuccess && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Thank you! Your message has been received. We'll get back to you shortly.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number <span className="text-gray-400">(Optional)</span>
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What can we help you with?"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your situation..."
                        className="min-h-[120px]"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Phone</h3>
                        <p className="text-muted-foreground">{CONTACT_PHONE}</p>
                        <p className="text-sm text-muted-foreground">24/7 Emergency Line</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-muted-foreground">{CONTACT_EMAIL}</p>
                        <p className="text-sm text-muted-foreground">We respond within 1 hour</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Address</h3>
                        <p className="text-muted-foreground">New York, NY</p>
                        <p className="text-sm text-muted-foreground">United States</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <Clock className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Business Hours</h3>
                        <p className="text-muted-foreground">24/7 Available</p>
                        <p className="text-sm text-muted-foreground">Emergency support always available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Emergency Fraud Report</h3>
                    <p className="mb-4 opacity-90">
                      If you're currently experiencing fraud, report it immediately for urgent assistance.
                    </p>
                    <Button variant="secondary" className="w-full" asChild>
                      <a href="/report">Report Fraud Now</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
