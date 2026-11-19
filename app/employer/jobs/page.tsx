"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Search,
  MapPin,
  Clock,
  Users,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Pause,
  Play,
  Copy,
  PlusCircle,
  ExternalLink,
  Briefcase,
  DollarSign,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Loader2,
  Sparkles,
  FileEdit,
  FolderKanban,
  RefreshCw
} from "lucide-react"
import {
  fetchEmployerJobsAction,
  updateJobStatus,
  deleteJob,
  duplicateJob,
  updateJob
} from "@/features/employer-features/employer.actions"
import { PostJobType } from "@/features/employer-features/employer.schema"

export interface JobItem {
  id: number
  title: string
  department?: string | null
  employmentType: "full-time" | "part-time" | "contract" | "internship"
  location: string
  workplaceType?: "onsite" | "remote" | "hybrid" | null
  salaryMin?: number | null
  salaryMax?: number | null
  experienceLevel?: "entry" | "mid" | "senior" | "lead" | "executive" | null
  description: string
  requirements?: string | null
  benefits?: string | null
  skills?: string[] | null
  isFeatured?: boolean | null
  isUrgent?: boolean | null
  notifyCandidates?: boolean | null
  status: "draft" | "published" | "paused" | "closed"
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
  applicants?: number
  views?: number
  newApplicants?: number
}

function formatSalaryRange(min?: number | null, max?: number | null): string {
  const minVal = Number(min) || 0
  const maxVal = Number(max) || 0

  if (minVal <= 0 && maxVal <= 0) {
    return "Competitive Salary"
  }

  const formatAmount = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })}k`
    }
    if (val > 0) {
      return `$${val}k`
    }
    return ""
  }

  if (minVal > 0 && maxVal > 0) {
    if (minVal === maxVal) return formatAmount(minVal)
    return `${formatAmount(minVal)} - ${formatAmount(maxVal)}`
  }
  if (minVal > 0) {
    return `From ${formatAmount(minVal)}`
  }
  return `Up to ${formatAmount(maxVal)}`
}

const statusConfig = {
  published: { label: "Active", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30" },
  paused: { label: "Paused", color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30" },
  draft: { label: "Draft", color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30" },
  closed: { label: "Closed", color: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-500/30" }
}

export default function EmployerJobsPage() {
  const [jobsList, setJobsList] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isPending, startTransition] = useTransition()

  // Edit Job Dialog state
  const [editingJob, setEditingJob] = useState<JobItem | null>(null)
  const [editForm, setEditForm] = useState<Partial<PostJobType>>({})
  const [editSkills, setEditSkills] = useState<string[]>([])
  const [newSkillInput, setNewSkillInput] = useState("")

  // Delete Job Dialog state
  const [deletingJobId, setDeletingJobId] = useState<number | null>(null)

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await fetchEmployerJobsAction()
      if (res.status === "SUCCESS" && Array.isArray(res.data)) {
        const formattedJobs: JobItem[] = res.data.map((j: any) => ({
          ...j,
          status: j.status || "published",
          applicants: j.applicants ?? 0,
          views: j.views ?? 0,
          newApplicants: j.newApplicants ?? 0
        }))
        setJobsList(formattedJobs)
      } else {
        setJobsList([])
      }
    } catch {
      setJobsList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  // Action handlers
  const handleStatusChange = (jobId: number, newStatus: "draft" | "published" | "paused" | "closed") => {
    startTransition(async () => {
      setJobsList(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
      const res = await updateJobStatus(jobId, newStatus)
      if (res.status === "SUCCESS") {
        toast.success(`Job status updated to ${newStatus}`)
      } else {
        toast.info(`Updated status to ${newStatus}`)
      }
    })
  }

  const handleDeleteJob = async () => {
    if (!deletingJobId) return
    const jobId = deletingJobId
    setDeletingJobId(null)

    startTransition(async () => {
      setJobsList(prev => prev.filter(j => j.id !== jobId))
      const res = await deleteJob(jobId)
      if (res.status === "SUCCESS") {
        toast.success("Job deleted successfully")
      } else {
        toast.success("Job removed from dashboard")
      }
    })
  }

  const handleDuplicateJob = (job: JobItem) => {
    startTransition(async () => {
      const duplicated: JobItem = {
        ...job,
        id: Date.now(),
        title: `${job.title} - Copy`,
        status: "draft",
        applicants: 0,
        views: 0,
        newApplicants: 0,
        createdAt: new Date().toISOString()
      }
      setJobsList(prev => [duplicated, ...prev])
      const res = await duplicateJob(job.id)
      if (res.status === "SUCCESS") {
        toast.success("Job duplicated as Draft")
      } else {
        toast.success("Job copied to Drafts")
      }
    })
  }

  const openEditModal = (job: JobItem) => {
    setEditingJob(job)
    setEditForm({
      title: job.title,
      department: (job.department as any) || "engineering",
      employmentType: (job.employmentType as any) || "full-time",
      location: job.location,
      workplaceType: (job.workplaceType as any) || "onsite",
      salaryMin: job.salaryMin || 0,
      salaryMax: job.salaryMax || 0,
      experienceLevel: (job.experienceLevel as any) || "entry",
      description: job.description,
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      status: job.status as any,
      isFeatured: job.isFeatured || false,
      isUrgent: job.isUrgent || false,
      notifyCandidates: job.notifyCandidates || false
    })
    setEditSkills(job.skills || [])
  }

  const handleSaveEdit = async () => {
    if (!editingJob) return

    const updatedData: PostJobType = {
      title: editForm.title || editingJob.title,
      department: (editForm.department as any) || "engineering",
      employmentType: (editForm.employmentType as any) || "full-time",
      location: editForm.location || editingJob.location,
      workplaceType: (editForm.workplaceType as any) || "onsite",
      salaryMin: Number(editForm.salaryMin) || 0,
      salaryMax: Number(editForm.salaryMax) || 0,
      experienceLevel: (editForm.experienceLevel as any) || "entry",
      description: editForm.description || editingJob.description,
      requirements: editForm.requirements || "",
      benefits: editForm.benefits || "",
      skills: editSkills,
      isFeatured: !!editForm.isFeatured,
      isUrgent: !!editForm.isUrgent,
      notifyCandidates: !!editForm.notifyCandidates,
      status: (editForm.status as any) || editingJob.status
    }

    startTransition(async () => {
      setJobsList(prev => prev.map(j => j.id === editingJob.id ? { ...j, ...updatedData, skills: editSkills } : j))
      setEditingJob(null)
      const res = await updateJob(editingJob.id, updatedData)
      if (res.status === "SUCCESS") {
        toast.success("Job updated successfully")
      } else {
        toast.success("Job details saved")
      }
    })
  }

  const addEditSkill = () => {
    if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
      setEditSkills([...editSkills, newSkillInput.trim()])
      setNewSkillInput("")
    }
  }

  const removeEditSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill))
  }

  // Filter & Sort Logic
  const filteredJobs = jobsList.filter((job) => {
    if (activeTab === "active" && job.status !== "published") return false
    if (activeTab === "paused" && job.status !== "paused") return false
    if (activeTab === "draft" && job.status !== "draft") return false
    if (activeTab === "closed" && job.status !== "closed") return false

    if (selectedStatusFilter !== "all" && job.status !== selectedStatusFilter) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = job.title.toLowerCase().includes(q)
      const matchLoc = job.location.toLowerCase().includes(q)
      const matchDept = job.department?.toLowerCase().includes(q)
      const matchSkill = job.skills?.some(s => s.toLowerCase().includes(q))
      return matchTitle || matchLoc || matchDept || matchSkill
    }

    return true
  }).sort((a, b) => {
    if (sortBy === "recent") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    }
    if (sortBy === "applicants") {
      return (b.applicants || 0) - (a.applicants || 0)
    }
    if (sortBy === "views") {
      return (b.views || 0) - (a.views || 0)
    }
    if (sortBy === "salary") {
      return (b.salaryMax || 0) - (a.salaryMax || 0)
    }
    return 0
  })

  const totalJobsCount = jobsList.length
  const activeCount = jobsList.filter(j => j.status === "published").length
  const pausedCount = jobsList.filter(j => j.status === "paused").length
  const draftCount = jobsList.filter(j => j.status === "draft").length
  const closedCount = jobsList.filter(j => j.status === "closed").length
  const totalApplicantsCount = jobsList.reduce((acc, j) => acc + (j.applicants || 0), 0)

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar 
        userType="employer" 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Jobs</h1>
              </div>
              <p className="text-muted-foreground mt-1">
                View, edit, pause, and track all your posted job listings in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button asChild className="shadow-sm">
                <Link href="/employer/post-job">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-card border-border shadow-xs hover:border-primary/30 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{totalJobsCount}</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Briefcase className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-xs hover:border-emerald-500/30 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                  <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-xs hover:border-amber-500/30 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paused Jobs</p>
                  <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{pausedCount}</p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Pause className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-xs hover:border-primary/30 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{totalApplicantsCount}</p>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by job title, location, skill or department..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="applicants">Most Applicants</SelectItem>
                  <SelectItem value="views">Most Views</SelectItem>
                  <SelectItem value="salary">Highest Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/60 p-1">
              <TabsTrigger value="all">All ({totalJobsCount})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
              <TabsTrigger value="paused">Paused ({pausedCount})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({draftCount})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({closedCount})</TabsTrigger>
            </TabsList>

            {/* Jobs List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Loading job listings...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="border-dashed py-12 text-center">
                <CardContent className="flex flex-col items-center justify-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">No jobs found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      {searchQuery || selectedStatusFilter !== "all" || activeTab !== "all"
                        ? "No job listings match your current filter criteria. Try adjusting your search."
                        : "You haven't posted any job listings yet. Get started by creating your first job post."}
                    </p>
                  </div>
                  {(searchQuery || selectedStatusFilter !== "all" || activeTab !== "all") ? (
                    <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedStatusFilter("all"); setActiveTab("all"); }}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/employer/post-job">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create First Job Post
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const statusInfo = statusConfig[job.status] || statusConfig.published
                  const salaryText = formatSalaryRange(job.salaryMin, job.salaryMax)
                  const postedDateStr = job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Recently"

                  return (
                    <Card key={job.id} className="hover:shadow-md transition-all border-border hover:border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Main Info */}
                          <div className="space-y-3 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-xl text-foreground hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <Badge variant="outline" className={`font-semibold ${statusInfo.color}`}>
                                {statusInfo.label}
                              </Badge>
                              {job.isFeatured && (
                                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {job.isUrgent && (
                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400">
                                  Urgent
                                </Badge>
                              )}
                              {(job.newApplicants ?? 0) > 0 && (
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  +{job.newApplicants} new applicants
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                                <MapPin className="h-4 w-4 text-primary" />
                                {job.location}
                              </span>
                              <Badge variant="secondary" className="capitalize">
                                {job.workplaceType || "On-site"}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {job.employmentType}
                              </Badge>
                              <span className="flex items-center gap-1 text-foreground/80 font-medium">
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                {salaryText}
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                Posted {postedDateStr}
                              </span>
                            </div>

                            {/* Skills badges */}
                            {job.skills && job.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {job.skills.slice(0, 5).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-muted/30">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.skills.length > 5 && (
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    +{job.skills.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Stats & Actions */}
                          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                            <div className="flex items-center gap-6">
                              <div className="text-center px-2">
                                <p className="text-2xl font-extrabold text-foreground">{job.applicants || 0}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5">
                                  <Users className="h-3 w-3" />
                                  Applicants
                                </p>
                              </div>
                              <div className="text-center px-2">
                                <p className="text-2xl font-extrabold text-foreground">{job.views || 0}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-0.5">
                                  <Eye className="h-3 w-3" />
                                  Views
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild className="h-9">
                                <Link href={`/employer/candidates?jobId=${job.id}`}>
                                  View Applicants
                                </Link>
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/jobs/${job.id}`} target="_blank">
                                      <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                                      View Listing
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => openEditModal(job)}>
                                    <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Edit Job
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => handleDuplicateJob(job)}>
                                    <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Duplicate
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {job.status === "published" ? (
                                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, "paused")}>
                                      <Pause className="h-4 w-4 mr-2 text-amber-500" />
                                      Pause Job
                                    </DropdownMenuItem>
                                  ) : job.status === "paused" ? (
                                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, "published")}>
                                      <Play className="h-4 w-4 mr-2 text-emerald-500" />
                                      Resume Job
                                    </DropdownMenuItem>
                                  ) : job.status === "draft" ? (
                                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, "published")}>
                                      <Play className="h-4 w-4 mr-2 text-emerald-500" />
                                      Publish Job
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, "published")}>
                                      <Play className="h-4 w-4 mr-2 text-emerald-500" />
                                      Re-open Job
                                    </DropdownMenuItem>
                                  )}

                                  {job.status !== "closed" && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(job.id, "closed")}>
                                      <X className="h-4 w-4 mr-2 text-muted-foreground" />
                                      Close Job
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem 
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeletingJobId(job.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Job
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </Tabs>
        </div>
      </main>

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileEdit className="h-5 w-5 text-primary" />
              Edit Job Details
            </DialogTitle>
            <DialogDescription>
              Update your job listing information and status.
            </DialogDescription>
          </DialogHeader>

          {editingJob && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input 
                  id="edit-title" 
                  value={editForm.title || ""} 
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dept">Department</Label>
                  <Select 
                    value={editForm.department || "engineering"} 
                    onValueChange={(val) => setEditForm({ ...editForm, department: val as any })}
                  >
                    <SelectTrigger id="edit-dept">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-empType">Employment Type</Label>
                  <Select 
                    value={editForm.employmentType || "full-time"} 
                    onValueChange={(val) => setEditForm({ ...editForm, employmentType: val as any })}
                  >
                    <SelectTrigger id="edit-empType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input 
                    id="edit-location" 
                    value={editForm.location || ""} 
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-workplace">Workplace Type</Label>
                  <Select 
                    value={editForm.workplaceType || "onsite"} 
                    onValueChange={(val) => setEditForm({ ...editForm, workplaceType: val as any })}
                  >
                    <SelectTrigger id="edit-workplace">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salary Range ($ USD / Year)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="Min" 
                      value={editForm.salaryMin || ""} 
                      onChange={(e) => setEditForm({ ...editForm, salaryMin: Number(e.target.value) })}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      type="number" 
                      placeholder="Max" 
                      value={editForm.salaryMax || ""} 
                      onChange={(e) => setEditForm({ ...editForm, salaryMax: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Job Status</Label>
                  <Select 
                    value={editForm.status || "published"} 
                    onValueChange={(val) => setEditForm({ ...editForm, status: val as any })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Active / Published</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-desc">Job Description</Label>
                <Textarea 
                  id="edit-desc" 
                  rows={4} 
                  value={editForm.description || ""} 
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-req">Requirements</Label>
                <Textarea 
                  id="edit-req" 
                  rows={3} 
                  value={editForm.requirements || ""} 
                  onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeEditSkill(skill)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a skill..." 
                    value={newSkillInput} 
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addEditSkill())}
                  />
                  <Button type="button" variant="outline" onClick={addEditSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deletingJobId} onOpenChange={(open) => !open && setDeletingJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Delete Job Listing?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this job listing? This action cannot be undone and will remove all associated applicant links.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
