interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || ""
    this.fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@fortivault.com"

    if (!this.apiKey) {
      console.warn(
        "[Fortivault] RESEND_API_KEY is not configured. Email sending will fail. Please set RESEND_API_KEY in your environment variables.",
      )
    }
  }

  async sendEmail({ to, subject, html, text }: EmailOptions) {
    try {
      if (!this.apiKey) {
        throw new Error("RESEND_API_KEY is not configured")
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Resend API error: ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      return { success: true, messageId: data.id }
    } catch (error) {
      console.error("[Fortivault] Email sending failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async sendOTP(email: string, otp: string, caseId: string) {
    const subject = "Verify Your Email - Fortivault"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Email Verification Required</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">
            Thank you for submitting your fraud report. To proceed with your case, please verify your email address.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px dashed #059669;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">Your Verification Code:</p>
            <h2 style="font-size: 32px; color: #1e3a8a; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h2>
          </div>
          
          <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
            <strong>Case ID:</strong> ${caseId}<br>
            <strong>Valid for:</strong> 10 minutes
          </p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for this code via phone or email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
          <p>Fortivault | Built to protect. Trusted to Secure</p>
        </div>
      </div>
    `

    return this.sendEmail({ to: email, subject, html })
  }

  async sendConfirmationEmail(email: string, caseId: string) {
    const subject = "Fraud Report Received - Fortivault"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Fraud Report Confirmation</h1>
        </div>

        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">
            Thank you for submitting your fraud report to Fortivault. We have successfully received your case and it is now in our system for processing.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Your Case Details:</h3>
            <p style="margin: 5px 0; font-size: 14px;"><strong>Case Reference Number:</strong></p>
            <p style="margin: 5px 0 15px 0; font-size: 18px; font-family: monospace; color: #059669; font-weight: bold;">${caseId}</p>
            <p style="margin: 5px 0; font-size: 13px; color: #64748b;">Please save this number for your records. You'll need it if you need to follow up on your case.</p>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
            <h4 style="color: #065f46; margin-top: 0;">What happens next?</h4>
            <ul style="color: #065f46; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Our recovery specialists will review your case within 24 hours</li>
              <li>You'll receive updates via email as your case progresses</li>
              <li>Additional information may be requested as needed</li>
              <li>We'll work on the recovery process immediately</li>
            </ul>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>Questions?</strong> Contact our support team at support@fortivault.com or visit our website for more information.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
          <p>Fortivault | Built to protect. Trusted to Secure</p>
          <p>24/7 Support Available | support@fortivault.com</p>
        </div>
      </div>
    `

    return this.sendEmail({ to: email, subject, html })
  }
}

export const emailService = new EmailService()
