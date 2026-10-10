"use client"

import { useEffect, useState, useTransition, useMemo } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search,
  Building2,
  MapPin,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  Trash2,
  Loader2,
  FileText
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { fetchApplicantApplicationsAction, withdrawApplication, fetchApplicantProfileAction } from "@/features/candidate-features/candidate.actions"

const statusConfig = {
  new: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
  screening: { label: "Under Review", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Eye },
  interview: { label: "Interview Scheduled", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: Calendar },
  offered: { label: "Offer Received", color: "bg-accent/10 text-accent border-accent/20", icon: CheckCircle },
  rejected: { label: "Not Selected", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
}

export default function CandidateApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [applications, setApplications] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("recent")
  const [tabFilter, setTabFilter] = useState("all")

  useEffect(() => {
    async function loadData() {
      try {
        const [appsRes, profileRes] = await Promise.all([
            fetchApplicantApplicationsAction(),
            fetchApplicantProfileAction()
        ]);
        
        if (appsRes.status === "SUCCESS") {
            setApplications(appsRes.data || []);
        }
        
        if (profileRes.status === "SUCCESS") {
            setUser(profileRes.data);
        }
      } catch (error) {
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [])

  const handleWithdraw = (appId: number) => {
      if (!window.confirm("Are you sure you want to withdraw this application?")) return;
      
      const prevState = [...applications];
      setApplications(prev => prev.filter(app => app.id !== appId));
      
      startTransition(async () => {
          const res = await withdrawApplication(appId);
          if (res.status === "SUCCESS") {
              toast.success(res.message);
          } else {
              setApplications(prevState);
              toast.error(res.message);
          }
      });
  }

  const filteredApplications = useMemo(() => {
      let filtered = [...applications];
      
      // Tab filter
      if (tabFilter === "active") {
          filtered = filtered.filter(a => !["rejected", "offered"].includes(a.status));
      } else if (tabFilter === "archived") {
          filtered = filtered.filter(a => ["rejected", "offered"].includes(a.status));
      }
      
      // Status filter
      if (statusFilter !== "all") {
          filtered = filtered.filter(a => a.status === statusFilter);
      }
      
      // Search filter
      if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(a => 
              a.jobTitle?.toLowerCase().includes(query) || 
              a.employerName?.toLowerCase().includes(query) ||
              a.jobLocation?.toLowerCase().includes(query)
          );
      }
      
      // Sort
      if (sortOrder === "recent") {
          filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
      } else if (sortOrder === "oldest") {
          filtered.sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());
      } else if (sortOrder === "company") {
          filtered.sort((a, b) => (a.employerName || "").localeCompare(b.employerName || ""));
      }
      
      return filtered;
  }, [applications, tabFilter, statusFilter, searchQuery, sortOrder]);

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
            <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your job applications
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{applications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {applications.filter(a => a.status === "new").length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {applications.filter(a => a.status === "screening").length}
                </p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === "interview").length}
                </p>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-accent">
                  {applications.filter(a => a.status === "offered").length}
                </p>
                <p className="text-sm text-muted-foreground">Offers</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                  placeholder="Search applications..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">Pending</SelectItem>
                <SelectItem value="screening">Under Review</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="company">Company A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={tabFilter} onValueChange={setTabFilter} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({applications.filter(a => !["rejected", "offered"].includes(a.status)).length})</TabsTrigger>
              <TabsTrigger value="archived">Archived ({applications.filter(a => ["rejected", "offered"].includes(a.status)).length})</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const status = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.new;
                const StatusIcon = status.icon;
                return (
                  <Card key={app.id} className={`hover:shadow-md transition-shadow ${["rejected", "offered"].includes(app.status) ? "opacity-80" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-lg font-bold uppercase">
                          {app.employerName?.charAt(0) || "C"}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-semibold text-foreground">{app.jobTitle}</h3>
                            <Badge variant="outline" className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {app.employerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.jobLocation}
                            </span>
                            {app.jobSalaryMin && app.jobSalaryMax && (
                                <span>${app.jobSalaryMin.toLocaleString()} - ${app.jobSalaryMax.toLocaleString()}</span>
                            )}
                          </div>
                          {app.status === "interview" && app.interviewDate && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">Interview: {new Date(app.interviewDate).toLocaleString()}</span>
                              {app.interviewType && (
                                  <span className="capitalize border-l border-green-600/30 pl-2 ml-2">{app.interviewType}</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:items-end gap-2">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/jobs/${app.jobId}`}>
                                View Job
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                            {!["rejected", "offered"].includes(app.status) && (
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleWithdraw(app.id)} disabled={isPending}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Withdraw
                                </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              
              {filteredApplications.length === 0 && (
                  <Card className="border-dashed p-12 text-center bg-muted/20">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="p-4 bg-primary/10 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-primary">
                            <FileText className="h-7 w-7" />
                        </div>
                        <h3 className="text-lg font-semibold">No applications found</h3>
                        <p className="text-muted-foreground">
                            {applications.length === 0 
                                ? "You haven't applied to any jobs yet." 
                                : "No applications match your current filters."}
                        </p>
                        {applications.length === 0 && (
                            <Button asChild>
                                <Link href="/jobs">Browse Jobs</Link>
                            </Button>
                        )}
                    </div>
                  </Card>
              )}
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
