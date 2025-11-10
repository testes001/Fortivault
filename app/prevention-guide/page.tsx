import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, Lock, AlertTriangle } from "lucide-react"

export default function PreventionGuidePage() {
  const tips = [
    {
      icon: Shield,
      title: "Verify Before You Trust",
      points: [
        "Research investment opportunities and brokers through official regulatory databases",
        "Verify company legitimacy through official phone numbers (not from ads or emails)",
        "Check social media profiles for authenticity (creation date, consistent history)",
        "Use reverse image search to detect catfishing and profile theft",
      ],
    },
    {
      icon: Lock,
      title: "Secure Your Digital Life",
      points: [
        "Use strong, unique passwords for each account (12+ characters with mixed case, numbers, symbols)",
        "Enable two-factor authentication on all important accounts",
        "Keep software and apps updated with latest security patches",
        "Use reputable antivirus and anti-malware software",
      ],
    },
    {
      icon: AlertTriangle,
      title: "Red Flags to Watch",
      points: [
        "Guaranteed returns or unrealistic promises (e.g., 'guaranteed 50% monthly returns')",
        "Pressure to act quickly or wire money immediately",
        "Requests for personal information or remote access to your computer",
        "Payment methods that can't be reversed (wire transfers, gift cards, cryptocurrency)",
      ],
    },
    {
      icon: CheckCircle,
      title: "Safe Financial Practices",
      points: [
        "Never share passwords, PINs, or two-factor authentication codes with anyone",
        "Avoid using public WiFi for banking or sensitive transactions",
        "Monitor your bank and credit card statements regularly",
        "Place fraud alerts on your credit reports with major credit bureaus",
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Fraud Prevention Guide</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Protect yourself from fraud with practical tips and best practices.
              </p>
            </div>
          </div>
        </section>

        {/* Prevention Tips */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {tips.map((tip) => {
                const Icon = tip.icon
                return (
                  <Card key={tip.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {tip.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary text-lg leading-none mt-0.5">•</span>
                            <span className="text-muted-foreground text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Stay Informed</h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Fraud tactics evolve constantly. Stay informed by following official government agencies and financial
                institutions for latest fraud alerts.
              </p>
              <p>
                Report suspected fraud to:
                <ul className="mt-3 space-y-2 ml-4">
                  <li>• Federal Trade Commission (FTC) at reportfraud.ftc.gov</li>
                  <li>• FBI Internet Crime Complaint Center (IC3) at ic3.gov</li>
                  <li>• Your local law enforcement agency</li>
                  <li>• Your financial institution or payment provider</li>
                </ul>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
