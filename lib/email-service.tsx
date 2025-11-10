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

  async sendWelcomeEmail(email: string, caseId: string, dashboardLink: string) {
    const subject = "Welcome to Fortivault - Your Dashboard is Ready"
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Your Recovery Journey</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #334155; margin-bottom: 20px;">
            Your fraud report has been successfully submitted and your secure dashboard is now ready.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="color: #1e3a8a; margin-top: 0;">Case Details:</h3>
            <p style="margin: 5px 0;"><strong>Case ID:</strong> ${caseId}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
            <p style="margin: 5px 0;"><strong>Assigned Agent:</strong> Will be assigned within 24 hours</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardLink}" style="background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #059669;">
            <h4 style="color: #065f46; margin-top: 0;">What happens next?</h4>
            <ul style="color: #065f46; margin: 0; padding-left: 20px;">
              <li>Our recovery specialists will review your case within 24 hours</li>
              <li>You'll receive updates via your dashboard and email</li>
              <li>A dedicated agent will be assigned to assist you</li>
              <li>We'll begin the recovery process immediately</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>Important:</strong> Keep this email safe. Your dashboard link is unique and secure. This link will expire when your case is closed.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
          <p>Fortivault | Built to protect. Trusted to Secure | 24/7 Support Available</p>
          <p>Need help? Reply to this email or contact support@fortivault.com</p>
        </div>
      </div>
    `

    return this.sendEmail({ to: email, subject, html })
  }
}

export const emailService = new EmailService()
