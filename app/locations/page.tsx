import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function LocationsPage() {
  const offices = [
    {
      city: "New York",
      region: "Eastern US",
      address: "123 Financial District, New York, NY 10001",
      phone: "+1 (212) 555-0100",
      email: "ny@fortivault.com",
      hours: "Monday - Friday: 9 AM - 6 PM EST",
    },
    {
      city: "San Francisco",
      region: "Western US",
      address: "456 Tech Valley, San Francisco, CA 94107",
      phone: "+1 (415) 555-0200",
      email: "sf@fortivault.com",
      hours: "Monday - Friday: 9 AM - 6 PM PST",
    },
    {
      city: "London",
      region: "Europe",
      address: "789 Financial Centre, London, UK EC2R 8AH",
      phone: "+44 (20) 7946 0958",
      email: "uk@fortivault.com",
      hours: "Monday - Friday: 9 AM - 6 PM GMT",
    },
    {
      city: "Singapore",
      region: "Asia-Pacific",
      address: "321 Marina Bay, Singapore 018956",
      phone: "+65 6511 5666",
      email: "asia@fortivault.com",
      hours: "Monday - Friday: 9 AM - 6 PM SGT",
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Locations</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Global presence with local expertise. Find our offices around the world.
              </p>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {offices.map((office) => (
                <Card key={office.city} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <div>{office.city}</div>
                        <div className="text-sm text-muted-foreground font-normal">{office.region}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <p className="text-foreground">{office.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Phone</p>
                      <a href={`tel:${office.phone}`} className="text-primary hover:underline">
                        {office.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <a href={`mailto:${office.email}`} className="text-primary hover:underline">
                        {office.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 pt-2">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{office.hours}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Global Support */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">24/7 Global Support</h2>
            <p className="text-lg text-muted-foreground mb-8">
              While our physical offices operate during business hours, our virtual support team is available 24/7 to
              assist you with fraud recovery needs.
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-foreground mb-2">Emergency Line (24/7)</p>
                <a href="tel:+14582983729" className="text-primary text-xl hover:underline">
                  +1 (458) 298-3729
                </a>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-2">General Inquiry</p>
                <a href="mailto:support@fortivault.com" className="text-primary text-xl hover:underline">
                  support@fortivault.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
