import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, LayoutDashboard, PlusCircle } from "lucide-react"
import Link from "next/link"

type CTAUser = {
  name: string
  role: "admin" | "employer" | "applicant"
} | null

interface CTASectionProps {
  user?: CTAUser
}

export function CTASection({ user = null }: CTASectionProps) {
  const isCandidate = user?.role === "applicant"
  const isEmployer = user?.role === "employer"
  const firstName = user?.name?.split(" ")[0]

  // ── Guest CTA ──
  if (!user) {
    return (
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
            Ready to Take the Next Step?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80 leading-relaxed text-pretty">
            Join thousands of professionals who have found their dream jobs through JobHax.
            Create your free account today and start your journey.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/jobs">
                Browse Jobs
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // ── Candidate CTA ──
  if (isCandidate) {
    return (
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
            Your Next Role Is Waiting
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80 leading-relaxed text-pretty">
            New jobs are added every day. Keep exploring, track your applications,
            and stay one step closer to your dream job.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/jobs" className="gap-2">
                Browse All Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/candidate/applications" className="gap-2">
                <FileText className="h-4 w-4" />
                My Applications
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // ── Employer CTA ──
  if (isEmployer) {
    return (
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
            Ready to Meet Great Candidates?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80 leading-relaxed text-pretty">
            Post your open roles and start receiving applications from qualified
            candidates — all from one dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/employer/post-job" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Post a Job
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/employer" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // ── Admin CTA ──
  return (
    <section className="bg-primary py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl text-balance">
          Welcome back, {firstName}!
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80 leading-relaxed text-pretty">
          Explore what&apos;s happening on the platform — browse the latest jobs
          and see what employers and candidates are up to.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/jobs" className="gap-2">
              Browse Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link href="/about">
              About JobHax
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
