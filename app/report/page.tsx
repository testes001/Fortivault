import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FraudReportingWizard } from "@/components/fraud-reporting-wizard"

export default function ReportPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Report a Fraud Case</h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Help us help you recover your funds by providing detailed information about the fraud incident.
              </p>
            </div>
            {/*
              Netlify Forms a11y:
              This hidden form is present to ensure Netlify's build bots correctly detect the form
              and set up the necessary backend infrastructure to handle submissions.
              The actual, client-side rendered form is in the FraudReportingWizard component.
            */}
            <form name="fraud-report" data-netlify="true" netlify-honeypot="bot-field" hidden>
              <input type="hidden" name="form-name" value="fraud-report" />
              <input type="hidden" name="bot-field" />
              <input type="text" name="fullName" />
              <input type="text" name="scamType" />
              <input type="text" name="amount" />
              <input type="text" name="currency" />
              <input type="text" name="timeline" />
              <textarea name="description"></textarea>
              <input type="email" name="contactEmail" />
              <input type="tel" name="contactPhone" />
              <input type="text" name="transactionHashes[]" />
              <input type="text" name="bankReferences[]" />
              <input type="file" name="evidenceFiles[]" multiple />
            </form>

            <FraudReportingWizard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
