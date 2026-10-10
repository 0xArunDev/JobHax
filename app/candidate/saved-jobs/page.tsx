"use client"

import { useEffect, useState, useTransition, useMemo } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  Trash2,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { fetchApplicantSavedJobsAction, unsaveJob, fetchApplicantProfileAction } from "@/features/candidate-features/candidate.actions"
import { formatDistanceToNow } from "date-fns"

export default function SavedJobsPage() {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  const [savedJobs, setSavedJobs] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const [savedRes, profileRes] = await Promise.all([
            fetchApplicantSavedJobsAction(),
            fetchApplicantProfileAction()
        ]);
        
        if (savedRes.status === "SUCCESS") {
            setSavedJobs(savedRes.data || []);
        }
        
        if (profileRes.status === "SUCCESS") {
            setUser(profileRes.data);
        }
      } catch (error) {
        toast.error("Failed to load saved jobs");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  const handleUnsave = (jobId: number) => {
      const prevState = [...savedJobs];
      setSavedJobs(prev => prev.filter(job => job.jobId !== jobId));
      
      startTransition(async () => {
          const res = await unsaveJob(jobId);
          if (res.status === "SUCCESS") {
              toast.success(res.message);
          } else {
              setSavedJobs(prevState);
              toast.error(res.message);
          }
      });
  }

  const filteredJobs = useMemo(() => {
      if (!searchQuery.trim()) return savedJobs;
      
      const query = searchQuery.toLowerCase();
      return savedJobs.filter(job => 
          job.jobTitle?.toLowerCase().includes(query) || 
          job.employerName?.toLowerCase().includes(query) ||
          job.jobLocation?.toLowerCase().includes(query)
      );
  }, [savedJobs, searchQuery]);

  if (loading) {
      return (
          <div className="flex min-h-screen">
              <DashboardSidebar userType="candidate" userName="" userEmail="" />
              <main className="flex-1 overflow-auto flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </main>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar 
        userType="candidate" 
        userName={user?.name || ""} 
        userEmail={user?.email || ""} 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Saved Jobs</h1>
            <p className="text-muted-foreground mt-1">
              Jobs you&apos;ve bookmarked for later
            </p>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Search saved jobs..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">
              You have <span className="font-semibold text-foreground">{savedJobs.length}</span> saved jobs
            </span>
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-xl font-bold uppercase">
                      {job.employerName?.charAt(0) || "C"}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                            <Link href={`/jobs/${job.jobId}`}>{job.jobTitle}</Link>
                          </h3>
                          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{job.employerName}</span>
                          </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleUnsave(job.jobId)}
                            disabled={isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                          <span className="sr-only">Remove from saved</span>
                        </Button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(job.jobSkills || []).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.jobLocation}
                        </span>
                        {job.jobSalaryMin && job.jobSalaryMax && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${job.jobSalaryMin.toLocaleString()} - ${job.jobSalaryMax.toLocaleString()}
                            </span>
                        )}
                        <Badge variant="outline" className="capitalize">{job.jobEmploymentType || job.jobWorkplaceType}</Badge>
                        {job.jobCreatedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Posted {formatDistanceToNow(new Date(job.jobCreatedAt))} ago
                            </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm text-muted-foreground">
                          Saved on {new Date(job.savedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" asChild>
                            <Link href={`/jobs/${job.jobId}`}>View Details</Link>
                          </Button>
                          <Button asChild>
                            <Link href={`/jobs/${job.jobId}`}>Apply Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {savedJobs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No saved jobs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start browsing jobs and save the ones you&apos;re interested in
                </p>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          {savedJobs.length > 0 && filteredJobs.length === 0 && (
              <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                      No saved jobs match your search.
                  </CardContent>
              </Card>
          )}
        </div>
      </main>
    </div>
  )
}
