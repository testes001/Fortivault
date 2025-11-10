import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Building2, Zap, TrendingUp } from "lucide-react"

export default function PartnershipsPage() {
  const partners = [
    {
      name: "Global Banking Alliance",
      category: "Financial Institutions",
      description: "Strategic partnership with major international banks for fund recovery operations",
      icon: Building2,
    },
    {
      name: "Blockchain Intelligence Unit",
      category: "Crypto Experts",
      description: "Advanced cryptocurrency tracing and blockchain analysis capabilities",
      icon: Shield,
    },
    {
      name: "International Law Enforcement",
      category: "Government Agencies",
      description: "Collaboration with federal and international law enforcement agencies",
      icon: TrendingUp,
    },
    {
      name: "Cyber Security Specialists",
      category: "Tech Partners",
      description: "Cutting-edge cybersecurity and digital forensics partnerships",
      icon: Zap,
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Partnerships</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We collaborate with industry-leading organizations to deliver comprehensive fraud recovery solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Partnerships Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {partners.map((partner) => {
                const Icon = partner.icon
                return (
                  <Card key={partner.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-3">
                            {partner.category}
                          </Badge>
                          <CardTitle className="text-xl">{partner.name}</CardTitle>
                        </div>
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{partner.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Our Partnerships Matter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Global Reach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access to international networks and resources to recover funds across borders.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Expert Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Specialized knowledge from leading experts in fraud prevention and recovery.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cutting-edge tools and systems for tracking and recovering stolen assets.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>24/7 Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Round-the-clock collaboration to ensure rapid response to your fraud cases.
                  </p>
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
