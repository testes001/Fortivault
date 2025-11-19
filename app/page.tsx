import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { ServicesSection } from "@/components/services-section"
import { TrustSection } from "@/components/trust-section"
import { CTABanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hidden static forms for Netlify Forms detection */}
      <div style={{ display: 'none' }}>
        {/* Fraud report form blueprint */}
        <form name="fraud-report" netlify="true" netlify-honeypot="bot-field" method="POST">
          <input type="hidden" name="form-name" value="fraud-report" />
          <input type="hidden" name="bot-field" />
          
          {/* Step 1: Scam Type */}
          <input type="hidden" name="scamType" />
          
          {/* Step 2: Personal Details */}
          <input type="text" name="fullName" />
          <input type="email" name="contactEmail" />
          <input type="tel" name="contactPhone" />
          
          {/* Step 3: Financial Details */}
          <input type="text" name="amount" />
          <input type="text" name="currency" />
          
          {/* Step 4: Timeline */}
          <input type="text" name="timeline" />
          
          {/* Step 5: Description */}
          <textarea name="description"></textarea>
          
          {/* Step 6: Evidence */}
          <input type="text" name="transactionHashes" />
          <input type="text" name="bankReferences" />
          <input type="text" name="evidenceFileCount" />
          <input type="text" name="evidenceFileNames" />
          
          {/* Additional metadata */}
          <input type="hidden" name="caseId" />
          <input type="hidden" name="submissionDate" />
        </form>

        {/* Contact form blueprint */}
        <form name="contact" netlify="true" netlify-honeypot="bot-field" method="POST">
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="bot-field" />
          <input type="text" name="name" />
          <input type="email" name="email" />
          <input type="text" name="subject" />
          <textarea name="message"></textarea>
        </form>
      </div>

      <Navigation />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ServicesSection />
        <TrustSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
