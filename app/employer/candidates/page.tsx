"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Briefcase,
  MoreVertical,
  Mail,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  RefreshCw,
  UserCheck,
  ArrowUpDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { ApplicationStatus } from "@/src/drizzle/schema";
import {
  fetchEmployerCandidatesAction,
  updateCandidateStatusAction,
  toggleCandidateStarredAction,
  deleteCandidateApplicationAction,
  seedDemoCandidatesAction,
} from "@/features/employer-features/employer.actions";
import {
  CandidateDetailsDialog,
  CandidateDetailData,
} from "@/components/candidate-details-dialog";
import {
  ScheduleInterviewDialog,
  CandidateItemForSchedule,
} from "@/components/schedule-interview-dialog";

export type CandidateItem = CandidateDetailData;

interface EmployerJobItem {
  id: number;
  title: string;
  department?: string | null;
  employmentType?: string;
  location?: string;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; dotColor: string }
> = {
  new: {
    label: "New",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  screening: {
    label: "Screening",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  interview: {
    label: "Interview",
    color: "bg-primary/10 text-primary border-primary/20",
    dotColor: "bg-primary",
  },
  offered: {
    label: "Offered",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    dotColor: "bg-rose-500",
  },
};

export default function EmployerCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [jobs, setJobs] = useState<EmployerJobItem[]>([]);
  const [employerUser, setEmployerUser] = useState<{
    name?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [activeTab, setActiveTab] = useState("all");

  // Modals state
  const [selectedCandidateForDetails, setSelectedCandidateForDetails] =
    useState<CandidateItem | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [selectedCandidateForSchedule, setSelectedCandidateForSchedule] =
    useState<CandidateItemForSchedule | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const [deletingApplicationId, setDeletingApplicationId] = useState<
    number | null
  >(null);

  const [isPending, startTransition] = useTransition();

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetchEmployerCandidatesAction();
      if (res.status === "SUCCESS" && res.data) {
        setCandidates(res.data.candidates as CandidateItem[]);
        setJobs(res.data.jobs as EmployerJobItem[]);
        if (res.data.employer) {
          setEmployerUser({
            name: res.data.employer.name,
            email: res.data.employer.email,
          });
        }
      } else {
        setCandidates([]);
        setJobs([]);
      }
    } catch {
      setCandidates([]);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  // Action: Toggle Star (Optimistic)
  const handleToggleStar = (candidateId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const nextStarred = !candidate.isStarred;
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, isStarred: nextStarred } : c))
    );

    if (selectedCandidateForDetails?.id === candidateId) {
      setSelectedCandidateForDetails((prev) =>
        prev ? { ...prev, isStarred: nextStarred } : null
      );
    }

    startTransition(async () => {
      const res = await toggleCandidateStarredAction(candidateId);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
      } else {
        // revert on error
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, isStarred: !nextStarred } : c
          )
        );
        toast.error("Failed to update star");
      }
    });
  };

  // Action: Update Candidate Status (Optimistic)
  const handleStatusChange = (
    candidateId: number,
    newStatus: ApplicationStatus,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) return;

    const prevStatus = candidate.status;
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
    );

    if (selectedCandidateForDetails?.id === candidateId) {
      setSelectedCandidateForDetails((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }

    startTransition(async () => {
      const res = await updateCandidateStatusAction(candidateId, newStatus);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
      } else {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, status: prevStatus } : c
          )
        );
        toast.error(res.message || "Failed to update status");
      }
    });
  };

  const handleOpenSchedule = (
    candidate: CandidateItem | CandidateItemForSchedule,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    setSelectedCandidateForSchedule({
      id: candidate.id,
      candidateName: candidate.candidateName,
      candidateEmail: candidate.candidateEmail,
      jobTitle: candidate.jobTitle,
      interviewDate: candidate.interviewDate,
      interviewType: candidate.interviewType,
      interviewNotes: candidate.interviewNotes,
    });
    setScheduleDialogOpen(true);
  };

  const handleOpenDetails = (candidate: CandidateItem) => {
    setSelectedCandidateForDetails(candidate);
    setDetailsDialogOpen(true);
  };

  const handleCandidateUpdated = (
    updated: Partial<CandidateItem> & { id: number }
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
    if (selectedCandidateForDetails?.id === updated.id) {
      setSelectedCandidateForDetails((prev) =>
        prev ? { ...prev, ...updated } : null
      );
    }
  };

  const handleDeleteApplication = async () => {
    if (!deletingApplicationId) return;
    const appId = deletingApplicationId;
    setDeletingApplicationId(null);

    const prevList = [...candidates];
    setCandidates((prev) => prev.filter((c) => c.id !== appId));

    startTransition(async () => {
      const res = await deleteCandidateApplicationAction(appId);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
      } else {
        setCandidates(prevList);
        toast.error(res.message || "Failed to delete application");
      }
    });
  };

  const handleSeedDemo = async () => {
    startTransition(async () => {
      const targetJobId =
        selectedJobFilter !== "all" ? Number(selectedJobFilter) : undefined;
      const res = await seedDemoCandidatesAction(targetJobId);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
        loadCandidates();
      } else {
        toast.error(res.message || "Failed to seed demo candidates");
      }
    });
  };

  const counts = useMemo(() => {
    return {
      total: candidates.length,
      starred: candidates.filter((c) => c.isStarred).length,
      new: candidates.filter((c) => c.status === "new").length,
      screening: candidates.filter((c) => c.status === "screening").length,
      interview: candidates.filter((c) => c.status === "interview").length,
      offered: candidates.filter((c) => c.status === "offered").length,
      rejected: candidates.filter((c) => c.status === "rejected").length,
    };
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((candidate) => {
        // Tab Filter
        if (activeTab === "starred" && !candidate.isStarred) return false;
        if (activeTab === "new" && candidate.status !== "new") return false;
        if (activeTab === "screening" && candidate.status !== "screening") return false;
        if (activeTab === "interview" && candidate.status !== "interview") return false;
        if (activeTab === "offered" && candidate.status !== "offered") return false;
        if (activeTab === "rejected" && candidate.status !== "rejected") return false;

        // Job Filter dropdown
        if (
          selectedJobFilter !== "all" &&
          String(candidate.jobId) !== selectedJobFilter
        ) {
          return false;
        }

        // Status Filter dropdown
        if (
          selectedStatusFilter !== "all" &&
          candidate.status !== selectedStatusFilter
        ) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = candidate.candidateName.toLowerCase().includes(q);
          const titleMatch = (candidate.candidateTitle || "")
            .toLowerCase()
            .includes(q);
          const jobMatch = (candidate.jobTitle || "").toLowerCase().includes(q);
          const emailMatch = candidate.candidateEmail.toLowerCase().includes(q);
          const skillsMatch = candidate.skills?.some((s) =>
            s.toLowerCase().includes(q)
          );
          const locationMatch = (candidate.candidateLocation || "")
            .toLowerCase()
            .includes(q);

          if (
            !nameMatch &&
            !titleMatch &&
            !jobMatch &&
            !emailMatch &&
            !skillsMatch &&
            !locationMatch
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") {
          return (b.matchScore ?? 0) - (a.matchScore ?? 0);
        }
        if (sortBy === "recent") {
          const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
          const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
          return dateB - dateA;
        }
        if (sortBy === "experience") {
          const expNum = (exp?: string | null) => {
            if (!exp) return 0;
            const match = exp.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          };
          return expNum(b.experience) - expNum(a.experience);
        }
        return 0;
      });
  }, [
    candidates,
    activeTab,
    selectedJobFilter,
    selectedStatusFilter,
    searchQuery,
    sortBy,
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        userType="employer"
        userName={employerUser?.name}
        userEmail={employerUser?.email}
      />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Candidates
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">
                Track, evaluate, screen, and interview applicants for your posted jobs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadCandidates}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleSeedDemo}
                disabled={isPending}
                className="hidden sm:inline-flex"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                {isPending ? "Seeding..." : "Seed Demo Applicants"}
              </Button>

              <Button asChild size="sm" className="shadow-xs">
                <Link href="/employer/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  View Posted Jobs
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
            <Card className="bg-card border-border shadow-2xs hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Applicants
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {counts.total}
                  </p>
                </div>
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-2xs hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Shortlisted
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {counts.starred}
                  </p>
                </div>
                <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Star className="h-5 w-5 fill-current" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-2xs hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    In Screening
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {counts.screening + counts.new}
                  </p>
                </div>
                <div className="p-2.5 bg-yellow-500/10 text-yellow-600 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-2xs hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Interviews
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {counts.interview}
                  </p>
                </div>
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-1 bg-card border-border shadow-2xs hover:border-primary/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Offers Extended
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {counts.offered}
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
                  <UserCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, skill, title, location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dynamic Job Filter */}
            <Select
              value={selectedJobFilter}
              onValueChange={setSelectedJobFilter}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="All Jobs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs ({candidates.length})</SelectItem>
                {jobs.map((job) => {
                  const jobCandidateCount = candidates.filter(
                    (c) => c.jobId === job.id
                  ).length;
                  return (
                    <SelectItem key={job.id} value={String(job.id)}>
                      {job.title} ({jobCandidateCount})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatusFilter}
              onValueChange={setSelectedStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[160px]">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Best Match</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pipeline Stage Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-10">
                <TabsTrigger value="all" className="px-3">
                  All ({counts.total})
                </TabsTrigger>
                <TabsTrigger value="starred" className="px-3">
                  Shortlisted ({counts.starred})
                </TabsTrigger>
                <TabsTrigger value="new" className="px-3">
                  New ({counts.new})
                </TabsTrigger>
                <TabsTrigger value="screening" className="px-3">
                  Screening ({counts.screening})
                </TabsTrigger>
                <TabsTrigger value="interview" className="px-3">
                  Interview ({counts.interview})
                </TabsTrigger>
                <TabsTrigger value="offered" className="px-3">
                  Offered ({counts.offered})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="px-3">
                  Rejected ({counts.rejected})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Candidate List View */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground text-sm">
                  Loading candidates...
                </p>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <Card className="border-dashed p-12 text-center bg-muted/20">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full w-14 h-14 mx-auto flex items-center justify-center text-primary">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {candidates.length === 0
                        ? "No candidates yet"
                        : "No matching candidates found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {candidates.length === 0
                        ? "When applicants apply for your posted jobs, their profiles and resumes will appear here."
                        : "Try adjusting your search query, filters, or tab selection to see more applicants."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {candidates.length === 0 ? (
                      <Button onClick={handleSeedDemo} disabled={isPending}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isPending
                          ? "Generating..."
                          : "Generate Demo Candidates"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedJobFilter("all");
                          setSelectedStatusFilter("all");
                          setActiveTab("all");
                        }}
                      >
                        Reset All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => {
                  const status =
                    statusConfig[candidate.status] || statusConfig.new;
                  const initials = candidate.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  const appliedDateFormatted = candidate.appliedAt
                    ? new Date(candidate.appliedAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "Recently";

                  return (
                    <Card
                      key={candidate.id}
                      className="hover:shadow-md hover:border-primary/40 transition-all cursor-pointer bg-card border-border group"
                      onClick={() => handleOpenDetails(candidate)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                          {/* Left Column: Avatar & Details */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                                  {candidate.candidateName}
                                </h3>

                                <button
                                  type="button"
                                  onClick={(e) => handleToggleStar(candidate.id, e)}
                                  className="text-amber-400 hover:text-amber-500 transition-transform active:scale-95 cursor-pointer p-0.5"
                                  title={
                                    candidate.isStarred
                                      ? "Remove from Shortlisted"
                                      : "Shortlist Candidate"
                                  }
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      candidate.isStarred
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/40 hover:text-muted-foreground"
                                    }`}
                                  />
                                </button>

                                <Badge
                                  variant="outline"
                                  className={`text-xs font-semibold px-2.5 py-0.5 ${status.color}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${status.dotColor}`}
                                  />
                                  {status.label}
                                </Badge>
                              </div>

                              <p className="text-muted-foreground text-sm font-medium mt-0.5">
                                {candidate.candidateTitle || "Applicant"}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                                {candidate.candidateLocation && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {candidate.candidateLocation}
                                  </span>
                                )}
                                {candidate.experience && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    {candidate.experience} experience
                                  </span>
                                )}
                                {candidate.interviewDate && (
                                  <span className="flex items-center gap-1 text-primary font-medium">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Interview:{" "}
                                    {new Date(
                                      candidate.interviewDate
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>

                              {/* Skills chips */}
                              {candidate.skills && candidate.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {candidate.skills.slice(0, 4).map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="secondary"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                  {candidate.skills.length > 4 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-2 py-0.5 text-muted-foreground"
                                    >
                                      +{candidate.skills.length - 4} more
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Applied for */}
                              <p className="text-xs text-muted-foreground mt-3">
                                Applied for:{" "}
                                <span className="font-semibold text-foreground">
                                  {candidate.jobTitle || "General Application"}
                                </span>
                                <span className="mx-2">•</span>
                                {appliedDateFormatted}
                              </p>
                            </div>
                          </div>

                          {/* Right Column: Match score & Actions */}
                          <div
                            className="flex lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="text-left lg:text-right">
                              <div className="text-2xl font-black text-accent tracking-tight flex items-center lg:justify-end gap-1">
                                {candidate.matchScore ?? 85}%
                                <Sparkles className="h-4 w-4 text-accent" />
                              </div>
                              <p className="text-[11px] font-medium text-muted-foreground">
                                Profile Match Score
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Resume View */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDetails(candidate)}
                              >
                                <FileText className="h-3.5 w-3.5 mr-1.5" />
                                Dossier
                              </Button>

                              {/* Schedule Interview */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => handleOpenSchedule(candidate, e)}
                              >
                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                Schedule
                              </Button>

                              {/* Direct Email */}
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="hidden sm:inline-flex"
                              >
                                <a href={`mailto:${candidate.candidateEmail}`}>
                                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                                  Email
                                </a>
                              </Button>

                              {/* More Options Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => handleOpenDetails(candidate)}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Full Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) =>
                                      handleOpenSchedule(candidate, e)
                                    }
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Interview
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  {candidate.status !== "screening" && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleStatusChange(
                                          candidate.id,
                                          "screening",
                                          e
                                        )
                                      }
                                      className="text-amber-600"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Move to Screening
                                    </DropdownMenuItem>
                                  )}

                                  {candidate.status !== "interview" && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleStatusChange(
                                          candidate.id,
                                          "interview",
                                          e
                                        )
                                      }
                                      className="text-primary"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Move to Interview
                                    </DropdownMenuItem>
                                  )}

                                  {candidate.status !== "offered" && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleStatusChange(
                                          candidate.id,
                                          "offered",
                                          e
                                        )
                                      }
                                      className="text-emerald-600"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Extend Job Offer
                                    </DropdownMenuItem>
                                  )}

                                  {candidate.status !== "rejected" && (
                                    <DropdownMenuItem
                                      onClick={(e) =>
                                        handleStatusChange(
                                          candidate.id,
                                          "rejected",
                                          e
                                        )
                                      }
                                      className="text-rose-600"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Mark as Rejected
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() =>
                                      setDeletingApplicationId(candidate.id)
                                    }
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Application
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </Tabs>
        </div>
      </main>

      {/* Candidate Profile & Evaluation Dossier Modal */}
      <CandidateDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        candidate={selectedCandidateForDetails}
        onCandidateUpdated={handleCandidateUpdated}
        onScheduleInterviewClick={(c) => {
          setSelectedCandidateForSchedule({
            id: c.id,
            candidateName: c.candidateName,
            candidateEmail: c.candidateEmail,
            jobTitle: c.jobTitle,
            interviewDate: c.interviewDate,
            interviewType: c.interviewType,
            interviewNotes: c.interviewNotes,
          });
          setScheduleDialogOpen(true);
        }}
      />

      {/* Schedule Interview Modal */}
      <ScheduleInterviewDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        candidate={selectedCandidateForSchedule}
        onSuccess={() => {
          loadCandidates();
        }}
      />

      {/* Delete Application Confirmation Alert */}
      <AlertDialog
        open={deletingApplicationId !== null}
        onOpenChange={(open) => !open && setDeletingApplicationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidate Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this applicant from your candidates pipeline? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
