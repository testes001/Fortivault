import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "Understanding Cryptocurrency Scams: A Comprehensive Guide",
      excerpt:
        "Learn about the most common cryptocurrency fraud schemes and how to identify warning signs before losing your money.",
      category: "Education",
      date: "November 2024",
      readTime: "8 min read",
    },
    {
      id: 2,
      title: "Romance Fraud: How Scammers Build Trust to Steal Money",
      excerpt:
        "Discover the tactics used in romance fraud and practical steps to protect yourself when meeting people online.",
      category: "Safety",
      date: "October 2024",
      readTime: "6 min read",
    },
    {
      id: 3,
      title: "Wire Fraud Recovery: What You Need to Know",
      excerpt:
        "Everything victims need to know about recovering funds lost to wire transfer fraud and working with authorities.",
      category: "Recovery",
      date: "October 2024",
      readTime: "7 min read",
    },
    {
      id: 4,
      title: "Red Flags of Investment Fraud You Should Never Ignore",
      excerpt:
        "Master the art of spotting fraudulent investment schemes before they cost you thousands in losses.",
      category: "Education",
      date: "September 2024",
      readTime: "5 min read",
    },
    {
      id: 5,
      title: "How Blockchain Technology is Being Used to Combat Fraud",
      excerpt:
        "Explore how innovative blockchain solutions are helping recover stolen cryptocurrency and fight fraud globally.",
      category: "Technology",
      date: "September 2024",
      readTime: "9 min read",
    },
    {
      id: 6,
      title: "Success Story: How We Recovered $150,000 in Crypto Fraud",
      excerpt:
        "Read about one victim's journey from despair to recovery and the key actions that made the difference.",
      category: "Success",
      date: "August 2024",
      readTime: "4 min read",
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Fortivault Blog</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Latest insights, tips, and stories about fraud prevention and recovery.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {posts.map((post) => (
                <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm">{post.excerpt}</p>
                  </CardContent>
                  <div className="px-6 pb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to receive the latest fraud prevention tips and recovery success stories directly in your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
