import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function EmergencyPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Alert Banner */}
        <section className="bg-destructive text-destructive-foreground py-4">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-semibold">If you're currently being scammed, call 911 or your local police immediately</p>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Emergency Fraud Report</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Immediate assistance for active fraud cases. Time is critical.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Actions */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8">Immediate Steps to Take</h2>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Stop All Contact",
                    description:
                      "Immediately cease all communication with the scammer. Do not send any additional money or information.",
                  },
                  {
                    step: 2,
                    title: "Secure Your Accounts",
                    description:
                      "Change passwords for all financial accounts. Enable two-factor authentication where available.",
                  },
                  {
                    step: 3,
                    title: "Document Everything",
                    description:
                      "Save all communications, transaction records, and evidence. Screenshot conversations and transfers.",
                  },
                  {
                    step: 4,
                    title: "Contact Your Bank",
                    description:
                      "Report the fraud to your bank or financial institution immediately. They may be able to freeze transfers.",
                  },
                  {
                    step: 5,
                    title: "File a Police Report",
                    description:
                      "Report to local law enforcement and provide them with all documentation of the fraud.",
                  },
                  {
                    step: 6,
                    title: "Report to Authorities",
                    description:
                      "File reports with FBI IC3 (ic3.gov), FTC (reportfraud.ftc.gov), and relevant agencies.",
                  },
                ].map((item) => (
                  <Card key={item.step} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-8">24/7 Emergency Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <Phone className="w-8 h-8 mx-auto mb-4" />
                <p className="font-semibold mb-2">Call Immediately</p>
                <a href="tel:+14582983729" className="text-lg hover:underline">
                  +1 (458) 298-3729
                </a>
                <p className="text-sm opacity-80 mt-2">Available 24/7</p>
              </div>
              <div>
                <Clock className="w-8 h-8 mx-auto mb-4" />
                <p className="font-semibold mb-2">Response Time</p>
                <p className="text-lg">Immediate</p>
                <p className="text-sm opacity-80 mt-2">Emergency calls prioritized</p>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/report">File Emergency Report</Link>
            </Button>
          </div>
        </section>

        {/* Helpful Resources */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-8">Important Resources</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    FBI Internet Crime Complaint Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="https://www.ic3.gov" className="text-primary hover:underline">
                    www.ic3.gov
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">Report cybercrime and fraud</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Federal Trade Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="https://reportfraud.ftc.gov" className="text-primary hover:underline">
                    reportfraud.ftc.gov
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">Report fraud and identity theft</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Local Law Enforcement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Contact your local police department to file an official report</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
