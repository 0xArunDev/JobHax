import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Stats } from "@/components/stats"
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { Card, CardContent } from "@/components/ui/card"
import { getCurrentUser } from "@/features/auth/server/auth.queries"
import {
  HeartHandshake,
  ShieldCheck,
  Target,
  Zap,
  User,
  Building2,
  Sparkles,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About JobHax - Our Mission",
  description:
    "Learn about JobHax — the platform connecting talented candidates with top employers, faster and more transparently.",
}

const values = [
  {
    icon: HeartHandshake,
    title: "Candidates First",
    description:
      "Every feature we build starts with the job seeker. Clear listings, honest salaries, and applications that never disappear into a black hole.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Over Quantity",
    description:
      "We favor verified employers and curated listings over endless spam, so your time is spent on opportunities that are real.",
  },
  {
    icon: Target,
    title: "Transparent by Default",
    description:
      "Salary ranges, workplace type, and honest timelines up front — for both sides of the hiring conversation.",
  },
  {
    icon: Zap,
    title: "Fast by Design",
    description:
      "From posting a job to accepting an offer, we cut out the busywork so hiring happens in days, not months.",
  },
]

export default async function AboutPage() {
  const user = await getCurrentUser()
  const ctaUser = user ? { name: user.name, role: user.role } : null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-28">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-32 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-accent/5 blur-3xl" />
          </div>
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                About JobHax
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Hiring Should Feel <span className="text-primary">Human</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
                JobHax exists to close the gap between talented people and the
                teams that need them — with transparency, speed, and respect on
                both sides of the table.
              </p>
            </div>
          </div>
        </section>

        {/* Who we serve */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">Built for Both Sides of Hiring</h2>
              <p className="mt-2 text-muted-foreground">
                One platform, two experiences — designed to work for everyone.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">For Candidates</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Create a profile in minutes, browse verified listings with real
                    salary ranges, save the roles you love, and track every
                    application from submitted to offer — in one place.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      One-click applications with your saved profile
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Save jobs and pick up where you left off
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Status updates at every stage of the process
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">For Employers</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Post a role and reach qualified candidates fast. Manage your
                    pipeline, chat with applicants, and make decisions with clear
                    analytics on how your jobs perform.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Publish a job in under five minutes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      A single pipeline from application to offer
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Analytics on views, saves, and conversion
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-secondary/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-foreground">What We Stand For</h2>
              <p className="mt-2 text-muted-foreground">
                The principles behind every decision we make.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <Card key={value.title} className="text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Stats />
        <Testimonials />
        <CTASection user={ctaUser} />
      </main>

      <Footer />
    </div>
  )
}
