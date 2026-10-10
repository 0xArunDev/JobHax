import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/features/auth/server/auth.queries"
import { ContactForm } from "./contact-form"
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact JobHax - Get in Touch",
  description:
    "Have a question about JobHax? Reach out to our team — we usually respond within 24 hours.",
}

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@jobhax.com",
    detail: "For general questions and support",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 012-3456",
    detail: "Mon - Fri, 9:00 AM - 6:00 PM PST",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "500 Innovation Dr",
    detail: "San Francisco, CA 94107",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "24/7 for urgent issues",
    detail: "Average response time: under 24h",
  },
]

export default async function ContactPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-secondary/30 py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <MessageSquare className="h-3.5 w-3.5" />
              Contact Us
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground text-balance">
              Get in Touch
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Questions about JobHax, your account, or hiring? We&apos;re here to
              help and usually respond within 24 hours.
            </p>
          </div>
        </section>

        {/* Contact content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact info */}
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <Card key={info.label}>
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{info.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5 break-words">
                          {info.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{info.detail}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    {user
                      ? `You're signed in as ${user.email} — we'll reply to this address.`
                      : "Fill in the form below and we'll get back to you as soon as possible."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactForm userName={user?.name ?? ""} userEmail={user?.email ?? ""} />
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
