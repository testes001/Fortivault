import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, TrendingDown, Lock, Smartphone } from "lucide-react"

export default function FraudTypesPage() {
  const fraudTypes = [
    {
      icon: Smartphone,
      title: "Cryptocurrency Fraud",
      description:
        "Scams involving Bitcoin, Ethereum, and other digital currencies. Includes Ponzi schemes, fake exchanges, and rug pulls.",
      warning: "Report suspicious crypto activity immediately for better recovery chances.",
    },
    {
      icon: TrendingDown,
      title: "Wire Transfer Fraud",
      description:
        "Unauthorized bank transfers, business email compromise, and payment diversion schemes affecting traditional banking.",
      warning: "Time is critical - contact your bank within 24 hours of discovering fraud.",
    },
    {
      icon: Lock,
      title: "Investment Fraud",
      description:
        "Fraudulent investment schemes, fake brokers, and promised returns that don't materialize. Often involving forex or stock trading.",
      warning: "Verify all investment opportunities through official regulatory channels.",
    },
    {
      icon: AlertCircle,
      title: "Romance & Catfishing Fraud",
      description:
        "Scammers posing as romantic interests to gain trust and request money for emergencies or investments.",
      warning: "Never send money to people you haven't met in person, even if you've been talking for months.",
    },
    {
      icon: Smartphone,
      title: "Tech Support Fraud",
      description:
        "Pop-ups and calls claiming your device is infected, leading victims to pay for fake repair services or grant remote access.",
      warning: "Legitimate tech companies don't initiate unsolicited support calls.",
    },
    {
      icon: TrendingDown,
      title: "Phishing & Email Fraud",
      description:
        "Deceptive emails or websites that trick you into revealing personal information, passwords, or financial details.",
      warning: "Always verify sender information and never click links from suspicious emails.",
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Types of Fraud</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Learn about common fraud schemes and how to protect yourself.
              </p>
            </div>
          </div>
        </section>

        {/* Fraud Types Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {fraudTypes.map((fraud) => {
                const Icon = fraud.icon
                return (
                  <Card key={fraud.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <CardTitle className="text-lg">{fraud.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-muted-foreground">{fraud.description}</p>
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                        <p className="text-sm text-destructive font-medium">⚠️ {fraud.warning}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Victim of Fraud?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              If you've fallen victim to any of these fraud types, don't panic. Help is available. Report your case
              immediately and let our experts guide you through the recovery process.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
