import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import { getPublicJobs } from "@/features/public-features/jobs.queries"
import { getCurrentUser } from "@/features/auth/server/auth.queries"
import { JobSaveButton } from "@/components/job-save-button"
import { formatDistanceToNow } from "date-fns"

export default async function JobsPage() {
  const jobs = await getPublicJobs();
  const user = await getCurrentUser();
  const isAuthenticated = !!user;
  const isApplicant = user?.role === "applicant";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-secondary/30 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Find Your Dream Job
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Browse through thousands of job openings from top companies and startups.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-card rounded-xl p-2 md:p-3 shadow-lg flex flex-col md:flex-row gap-3 border border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Job title, keywords, or company" 
                className="pl-10 h-12 border-0 focus-visible:ring-0 shadow-none bg-transparent text-foreground"
              />
            </div>
            <div className="hidden md:block w-[1px] bg-border my-2" />
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="City, state, or 'Remote'" 
                className="pl-10 h-12 border-0 focus-visible:ring-0 shadow-none bg-transparent text-foreground"
              />
            </div>
            <Button size="lg" className="h-12 px-8">
              Search Jobs
            </Button>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-foreground">Job Type</h3>
              <div className="space-y-3">
                {["full-time", "part-time", "contract", "freelance"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={`type-${type}`} />
                    <Label htmlFor={`type-${type}`} className="text-muted-foreground capitalize cursor-pointer">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4 text-foreground">Workplace</h3>
              <div className="space-y-3">
                {["remote", "hybrid", "on-site"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox id={`level-${level}`} />
                    <Label htmlFor={`level-${level}`} className="text-muted-foreground capitalize cursor-pointer">
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-muted-foreground font-medium">
                Showing <span className="text-foreground">{jobs.length}</span> jobs
              </p>
              
              <div className="flex items-center gap-3">
                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-8">
                        <p className="text-muted-foreground text-sm">Filters are visual only in this version.</p>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="salary-high">Salary (High-Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job List */}
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Logo */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl font-bold uppercase">
                        {job.employerName?.charAt(0) || "C"}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                                <Link href={`/jobs/${job.id}`}>
                                  {job.title}
                                </Link>
                              </h3>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                              <Building2 className="h-4 w-4" />
                              <span>{job.employerName}</span>
                            </div>
                          </div>
                          <JobSaveButton jobId={job.id} isAuthenticated={isAuthenticated} isApplicant={isApplicant} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(job.skills || []).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          {job.salaryMin && job.salaryMax && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                              </span>
                          )}
                          {job.createdAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Posted {formatDistanceToNow(job.createdAt)} ago
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {jobs.length === 0 && (
                  <Card className="p-12 text-center bg-muted/20 border-dashed">
                      <p className="text-muted-foreground">No jobs available.</p>
                  </Card>
              )}
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
