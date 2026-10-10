import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, ArrowRight, Sparkles, PlusCircle, LayoutDashboard, FileText, Bookmark } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  user: {
    name: string
    role: "admin" | "employer" | "applicant"
  } | null
}

export function HeroSection({ user }: HeroSectionProps) {
  const isCandidate = user?.role === "applicant"
  const isEmployer = user?.role === "employer"
  const firstName = user?.name?.split(" ")[0]

  // ── Logged-in Employer Hero ──
  if (isEmployer) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-accent/5 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-accent/6 blur-3xl" />
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back, {firstName}!
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Find Your Next{" "}
              <span className="text-primary">Perfect Hire</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Post jobs, manage applications, and discover talented candidates — all from your employer dashboard.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2 px-8">
                <Link href="/employer/post-job">
                  <PlusCircle className="h-5 w-5" />
                  Post a New Job
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 px-8">
                <Link href="/employer">
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/employer/candidates" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <span className="h-2 w-2 rounded-full bg-accent" />
                View Candidates
              </Link>
              <Link href="/employer/jobs" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Manage Jobs
              </Link>
              <Link href="/employer/analytics" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <span className="h-2 w-2 rounded-full bg-chart-3" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Logged-in Candidate Hero ──
  if (isCandidate) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/8 via-background to-primary/5 py-20 lg:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/6 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/6 blur-3xl" />
        </div>
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 gap-1.5 bg-accent/10 text-accent border-accent/20 hover:bg-accent/15">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome back, {firstName}!
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Continue Your{" "}
              <span className="text-primary">Job Search</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Discover new opportunities, track your applications, and take the next step in your career journey.
            </p>

            {/* Search bar for candidates */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center rounded-xl bg-card p-3 shadow-lg border border-border max-w-2xl mx-auto">
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-background px-4 py-2">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Job title or keyword"
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                />
              </div>
              <div className="hidden sm:flex h-8 w-px bg-border" />
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-background px-4 py-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Location"
                  className="border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
                />
              </div>
              <Button size="lg" className="gap-2" asChild>
                <Link href="/jobs">
                  Search Jobs
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/candidate/applications"
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                My Applications
              </Link>
              <Link
                href="/candidate/saved-jobs"
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Saved Jobs
              </Link>
              <Link
                href="/candidate/profile"
                className="flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ── Guest / Public Hero ──
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background py-20 lg:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Over 10,000+ jobs available
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Find Your Dream Job with{" "}
            <span className="text-primary">JobHax</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
            Connect with top employers and discover opportunities that match your skills.
            Your next career move starts here.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center rounded-xl bg-card p-3 shadow-lg border border-border max-w-2xl mx-auto">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-background px-4 py-2">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Job title or keyword"
                className="border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </div>
            <div className="hidden sm:flex h-8 w-px bg-border" />
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-background px-4 py-2">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                type="text"
                placeholder="Location"
                className="border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground"
              />
            </div>
            <Button size="lg" className="gap-2" asChild>
              <Link href="/jobs">
                Search Jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium">Popular:</span>
            {["Developer", "Designer", "Marketing", "Sales", "Data Science"].map((tag) => (
              <Link
                key={tag}
                href={`/jobs?q=${tag.toLowerCase()}`}
                className="rounded-full bg-secondary px-3 py-1 transition-colors hover:bg-secondary/80 hover:text-foreground"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
