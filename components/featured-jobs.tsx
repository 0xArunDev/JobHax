import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, DollarSign, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"
import { JobSaveButton } from "@/components/job-save-button"
import { formatDistanceToNow } from "date-fns"

export type FeaturedJob = {
  id: number
  title: string
  location: string
  employmentType: string
  salaryMin: number | null
  salaryMax: number | null
  skills: string[] | null
  createdAt: Date | null
  employerName: string | null
  isFeatured: boolean | null
}

interface FeaturedJobsProps {
  jobs: FeaturedJob[]
  isAuthenticated: boolean
  isApplicant: boolean
}

const formatSalary = (min: number | null, max: number | null) => {
  if (min == null || max == null) return null
  const compact = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`)
  return `${compact(min)} - ${compact(max)}`
}

export function FeaturedJobs({ jobs, isAuthenticated, isApplicant }: FeaturedJobsProps) {
  const canSave = !isAuthenticated || isApplicant

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Jobs</h2>
            <p className="mt-2 text-muted-foreground">
              Discover opportunities from top companies
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/jobs" className="gap-2">
              View All Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card className="p-12 text-center bg-muted/20 border-dashed">
            <p className="text-muted-foreground">No jobs posted yet. Check back soon!</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/jobs">Browse All Jobs</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const salary = formatSalary(job.salaryMin, job.salaryMax)
              const showFeatured = !!job.isFeatured

              return (
                <Card
                  key={job.id}
                  className={`group transition-all hover:shadow-md ${showFeatured ? "border-primary/30 bg-primary/5" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-lg font-bold text-secondary-foreground uppercase">
                        {job.employerName?.charAt(0) || "C"}
                      </div>
                      <div className="flex items-center gap-1">
                        {showFeatured && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Featured
                          </Badge>
                        )}
                        {canSave && (
                          <JobSaveButton
                            jobId={job.id}
                            isAuthenticated={isAuthenticated}
                            isApplicant={isApplicant}
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {job.employerName || "Company"}
                      </div>
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.skills.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      {salary && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {salary}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {job.createdAt
                          ? `Posted ${formatDistanceToNow(job.createdAt)} ago`
                          : job.employmentType}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
