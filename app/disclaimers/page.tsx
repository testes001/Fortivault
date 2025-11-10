import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function DisclaimersPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Disclaimers</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">No Guarantee of Recovery</h2>
            <p>
              Fortivault provides fraud recovery assistance and consultation services. However, we cannot guarantee
              successful fund recovery in any case. The success of recovery efforts depends on numerous factors beyond
              our control, including the actions of third parties, legal jurisdictions, and the nature of the fraud.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Not Legal Advice</h2>
            <p>
              The information provided by Fortivault is for informational purposes only and does not constitute legal
              advice. We recommend consulting with a qualified attorney regarding your specific situation and legal
              obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Financial Information</h2>
            <p>
              Any financial information, projections, or estimates provided are based on information available at the
              time and are subject to change. Past recovery rates do not guarantee future results.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">User Responsibility</h2>
            <p>
              Users are responsible for providing accurate information about their fraud cases. Fortivault reserves
              the right to terminate services if false or misleading information is discovered.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. Fortivault is not responsible for the content,
              accuracy, or practices of external websites. Access to third-party sites is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Limitation of Liability</h2>
            <p>
              To the extent permitted by law, Fortivault shall not be liable for any indirect, incidental, special,
              or consequential damages arising from your use of our services or information provided.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to Services</h2>
            <p>
              Fortivault reserves the right to modify, suspend, or discontinue services at any time without notice.
              We are not liable for any disruption of services.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
