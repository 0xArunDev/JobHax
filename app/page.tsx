import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturedJobs } from "@/components/featured-jobs"
import { HowItWorks } from "@/components/how-it-works"
import { Stats } from "@/components/stats"
import { Testimonials } from "@/components/testimonials"
import { CTASection } from "@/components/cta-section"
import { getCurrentUser } from "@/features/auth/server/auth.queries"
import { getPublicJobs } from "@/features/public-features/jobs.queries"

export default async function HomePage() {
  const user = await getCurrentUser()

  const heroUser = user ? { name: user.name, role: user.role } : null
  const role = user?.role ?? null

  const isGuest = !user
  const showStats = isGuest || role === "employer" || role === "admin"
  const showFeatured = isGuest || role === "applicant" || role === "admin"
  const showMarketing = isGuest

  const jobs = showFeatured ? await getPublicJobs() : []
  const featuredJobs = jobs
    .slice()
    .sort((a, b) => Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false))
    .slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection user={heroUser} />
        {showStats && <Stats />}
        {showFeatured && (
          <FeaturedJobs
            jobs={featuredJobs}
            isAuthenticated={!!user}
            isApplicant={role === "applicant"}
          />
        )}
        {showMarketing && (
          <>
            <HowItWorks />
            <Testimonials />
          </>
        )}
        <CTASection user={heroUser} />
      </main>
      <Footer />
    </div>
  )
}
