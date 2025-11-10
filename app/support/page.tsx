import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Mail, Clock } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Center</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We're here to help. Get answers to your questions and connect with our support team.
              </p>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <CardTitle>Call Us</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">Speak directly with our support specialists.</p>
                  <a href="tel:+14582983729" className="text-primary font-semibold hover:underline">
                    +1 (458) 298-3729
                  </a>
                  <p className="text-sm text-muted-foreground">Available 24/7 for emergencies</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <CardTitle>Email Support</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">Send us your questions anytime.</p>
                  <a href="mailto:support@fortivault.com" className="text-primary font-semibold hover:underline">
                    support@fortivault.com
                  </a>
                  <p className="text-sm text-muted-foreground">Response within 1 hour during business hours</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <CardTitle>Live Chat</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">Chat with us in real-time.</p>
                  <Button variant="outline" className="w-full">
                    Start Chat Session
                  </Button>
                  <p className="text-sm text-muted-foreground">Available Monday-Friday, 9 AM - 6 PM EST</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <CardTitle>Response Times</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>🔴 Emergency: Immediate</li>
                    <li>📧 Email: 1 hour response</li>
                    <li>💬 Chat: Real-time</li>
                    <li>📱 Phone: Direct connection</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ and Resources */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Need Immediate Help?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-auto py-4">
                <Link href="/faq">Read Our FAQ</Link>
              </Button>
              <Button asChild className="h-auto py-4">
                <Link href="/report">Report Fraud Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
