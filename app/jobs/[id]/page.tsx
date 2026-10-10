import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { getPublicJobById } from "@/features/public-features/jobs.queries"
import { notFound } from "next/navigation"
import { getCurrentUser } from "@/features/auth/server/auth.queries"
import { JobActions, ApplyButton } from "@/components/job-actions"
import { formatDistanceToNow } from "date-fns"

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) notFound();

  const jobData = await getPublicJobById(jobId);
  if (!jobData) notFound();

  const user = await getCurrentUser();
  const isAuthenticated = !!user;
  const isApplicant = user?.role === "applicant";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary/20">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl font-bold text-secondary-foreground uppercase">
                      {jobData.employerName?.charAt(0) || "C"}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold text-foreground">
                              {jobData.title}
                            </h1>
                          </div>
                          <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{jobData.employerName}</span>
                          </div>
                        </div>
                        
                        <JobActions 
                            jobId={jobId} 
                            jobTitle={jobData.title}
                            employerName={jobData.employerName || "Employer"}
                            isAuthenticated={isAuthenticated} 
                            isApplicant={isApplicant} 
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {jobData.location}
                        </span>
                        {jobData.salaryMin && jobData.salaryMax && (
                            <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${jobData.salaryMin.toLocaleString()} - ${jobData.salaryMax.toLocaleString()}
                            </span>
                        )}
                        <Badge variant="outline" className="capitalize">{jobData.employmentType}</Badge>
                        {jobData.createdAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Posted {formatDistanceToNow(jobData.createdAt)} ago
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(jobData.skills || []).map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {jobData.description}
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Card */}
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <ApplyButton 
                        jobId={jobId} 
                        jobTitle={jobData.title}
                        employerName={jobData.employerName || "Employer"}
                        isAuthenticated={isAuthenticated}
                        isApplicant={isApplicant}
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Job Type</p>
                        <p className="text-sm text-muted-foreground capitalize">{jobData.employmentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Workplace</p>
                        <p className="text-sm text-muted-foreground capitalize">{jobData.workplaceType}</p>
                      </div>
                    </div>
                    {jobData.department && (
                        <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Department</p>
                            <p className="text-sm text-muted-foreground capitalize">{jobData.department}</p>
                        </div>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Company</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-lg font-bold uppercase">
                      {jobData.employerName?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="font-semibold">{jobData.employerName}</p>
                      {jobData.employerLocation && <p className="text-sm text-muted-foreground">{jobData.employerLocation}</p>}
                    </div>
                  </div>
                  
                  {jobData.employerMetadata && (jobData.employerMetadata as any).description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {(jobData.employerMetadata as any).description}
                      </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {jobData.employerMetadata && (jobData.employerMetadata as any).companySize && (
                        <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{(jobData.employerMetadata as any).companySize} employees</span>
                        </div>
                    )}
                    {jobData.employerMetadata && (jobData.employerMetadata as any).websiteUrl && (
                        <div className="flex items-center gap-2 mt-4">
                        <Button variant="outline" className="w-full" asChild>
                            <a href={(jobData.employerMetadata as any).websiteUrl} target="_blank" rel="noopener noreferrer">Visit Website</a>
                        </Button>
                        </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
