import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">What Are Cookies?</h2>
            <p>
              Cookies are small data files that are placed on your device when you visit our website. They allow us to
              recognize your device and store information about your preferences and browsing habits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>
                <strong>Authentication:</strong> To keep you logged in to your account securely
              </li>
              <li>
                <strong>Preferences:</strong> To remember your theme preference (light/dark mode) and other settings
              </li>
              <li>
                <strong>Analytics:</strong> To understand how users interact with our website and improve our services
              </li>
              <li>
                <strong>Security:</strong> To detect and prevent fraud, abuse, and other malicious activities
              </li>
              <li>
                <strong>Performance:</strong> To optimize website performance and user experience
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the website to function properly. They enable core functionality such
                  as security, authentication, and form submission. You cannot opt out of these cookies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Functional Cookies</h3>
                <p>
                  These cookies remember your preferences and choices to provide a personalized experience. Examples
                  include language preferences and theme selection.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Analytics Cookies</h3>
                <p>
                  We use analytics cookies (including Google Analytics) to understand how visitors use our website.
                  This helps us improve content, navigation, and overall user experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Third-Party Cookies</h3>
                <p>
                  Our website may contain content or services from third parties that may set their own cookies. We do
                  not control these cookies and recommend reviewing their privacy policies.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Cookie Duration</h2>
            <p>
              Cookies can be either "session" cookies (deleted when you close your browser) or "persistent" cookies
              (stored on your device until they expire or you delete them). We use both types as appropriate for their
              function.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Managing Your Cookies</h2>
            <p>Most web browsers allow you to control cookies through settings. You can:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>View cookies stored on your device</li>
              <li>Delete cookies at any time</li>
              <li>Block cookies from specific websites</li>
              <li>Enable or disable all cookies</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> Disabling essential cookies may prevent the website from functioning properly. Some
              features may not be available without cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Privacy Rights</h2>
            <p>
              Under GDPR and CCPA, you have the right to know what cookies are being used and to opt out of
              non-essential cookies. We provide clear cookie consent options when you first visit our website.
            </p>
            <p className="mt-4">
              You can update your cookie preferences at any time by clicking the cookie preferences link in the footer
              of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
            <p>
              If you have questions about our cookie practices or wish to request removal of cookies, please contact us
              at privacy@fortivault.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Policy Updates</h2>
            <p>
              This cookie policy may be updated from time to time to reflect changes in our practices or applicable
              regulations. We will notify you of significant changes by updating the revision date below.
            </p>
            <p className="mt-4 text-sm">Last updated: November 2024</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
