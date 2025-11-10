import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function CompliancePage() {
  const standards = [
    { title: "GDPR Compliant", description: "Full compliance with General Data Protection Regulation" },
    { title: "SOC 2 Certified", description: "Service Organization Control 2 Type II certification" },
    { title: "ISO 27001", description: "Information Security Management System certified" },
    { title: "CCPA Compliant", description: "California Consumer Privacy Act requirements met" },
    { title: "AML/KYC", description: "Anti-Money Laundering and Know Your Customer protocols" },
    { title: "Industry Standards", description: "Adherence to financial and cybersecurity best practices" },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Compliance & Standards</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Fortivault maintains the highest standards of compliance and security to protect your data.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {standards.map((standard) => (
                <Card key={standard.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <CardTitle className="text-lg">{standard.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{standard.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8">Our Commitment to Compliance</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                At Fortivault, we understand that handling sensitive financial and personal information requires the
                highest level of security and regulatory compliance. Our commitment extends across all operational
                areas.
              </p>
              <p>
                We conduct regular audits, maintain comprehensive documentation, and ensure all team members receive
                ongoing compliance training. Our systems are designed with security-first architecture and are
                regularly tested for vulnerabilities.
              </p>
              <p>
                For detailed compliance information or audit reports, please contact our compliance team at
                compliance@fortivault.com.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
