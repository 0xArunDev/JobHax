"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  ExternalLink,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  Globe,
  Linkedin,
} from "lucide-react";
import { ApplicationStatus } from "@/src/drizzle/schema";
import {
  updateCandidateStatusAction,
  toggleCandidateStarredAction,
  updateCandidateNotesAction,
} from "@/features/employer-features/employer.actions";

export interface CandidateDetailData {
  id: number;
  jobId: number;
  applicantId?: number | null;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string | null;
  candidateLocation?: string | null;
  candidateTitle?: string | null;
  experience?: string | null;
  education?: string | null;
  skills?: string[] | null;
  resumeUrl?: string | null;
  coverLetter?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  status: ApplicationStatus;
  isStarred: boolean;
  matchScore?: number | null;
  interviewDate?: string | Date | null;
  interviewType?: string | null;
  interviewNotes?: string | null;
  notes?: string | null;
  appliedAt?: string | Date | null;
  updatedAt?: string | Date | null;
  jobTitle?: string | null;
  jobDepartment?: string | null;
  jobLocation?: string | null;
  jobEmploymentType?: string | null;
}

const statusBadgeStyles: Record<ApplicationStatus, { label: string; color: string }> = {
  new: { label: "New Application", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  screening: { label: "In Screening", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  interview: { label: "Interview Scheduled", color: "bg-primary/10 text-primary border-primary/20" },
  offered: { label: "Offer Extended", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rejected: { label: "Not Selected", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
};

interface CandidateDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateDetailData | null;
  onCandidateUpdated: (updated: Partial<CandidateDetailData> & { id: number }) => void;
  onScheduleInterviewClick: (candidate: CandidateDetailData) => void;
}

export function CandidateDetailsDialog({
  open,
  onOpenChange,
  candidate,
  onCandidateUpdated,
  onScheduleInterviewClick,
}: CandidateDetailsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(candidate?.notes || "");
  const [activeTab, setActiveTab] = useState("overview");

  // Keep notes in sync when candidate changes
  const handleOpen = (isOpen: boolean) => {
    if (isOpen && candidate) {
      setNotes(candidate.notes || "");
      setActiveTab("overview");
    }
    onOpenChange(isOpen);
  };

  if (!candidate) return null;

  const currentStatusConfig = statusBadgeStyles[candidate.status] || statusBadgeStyles.new;

  const initials = candidate.candidateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    startTransition(async () => {
      onCandidateUpdated({ id: candidate.id, status: newStatus });
      const res = await updateCandidateStatusAction(candidate.id, newStatus);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    });
  };

  const handleToggleStar = () => {
    startTransition(async () => {
      const nextStar = !candidate.isStarred;
      onCandidateUpdated({ id: candidate.id, isStarred: nextStar });
      const res = await toggleCandidateStarredAction(candidate.id);
      if (res.status === "SUCCESS") {
        toast.success(res.message);
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updateCandidateNotesAction(candidate.id, notes);
      if (res.status === "SUCCESS") {
        onCandidateUpdated({ id: candidate.id, notes });
        toast.success(res.message);
      } else {
        toast.error(res.message || "Failed to save notes");
      }
    });
  };

  // Next stage transition helper
  const stages: ApplicationStatus[] = ["new", "screening", "interview", "offered"];
  const currentIdx = stages.indexOf(candidate.status);
  const nextStage = currentIdx >= 0 && currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header with Candidate Dossier */}
        <div className="p-6 border-b bg-card/60 backdrop-blur-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-foreground">
                    {candidate.candidateName}
                  </h2>
                  <button
                    onClick={handleToggleStar}
                    className="text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
                    title={candidate.isStarred ? "Remove from shortlisted" : "Add to shortlisted"}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        candidate.isStarred ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  <Badge variant="outline" className={currentStatusConfig.color}>
                    {currentStatusConfig.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm font-medium mt-0.5">
                  {candidate.candidateTitle || "Candidate"}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    Applied: {candidate.jobTitle || "Job"}
                  </span>
                  {candidate.candidateLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {candidate.candidateLocation}
                    </span>
                  )}
                  {candidate.experience && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {candidate.experience} experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Match score & Status Selector */}
            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{candidate.matchScore ?? 85}% Match</span>
                </div>
              </div>

              {/* Quick Status Dropdown */}
              <div className="w-[160px]">
                <Select
                  value={candidate.status}
                  onValueChange={(val) => handleStatusChange(val as ApplicationStatus)}
                >
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue placeholder="Update stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Application</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offered">Offer Made</SelectItem>
                    <SelectItem value="rejected">Not Selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="grid grid-cols-4 w-full sm:w-[480px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="interview">
                Interview
                {candidate.interviewDate && (
                  <span className="ml-1.5 h-2 w-2 rounded-full bg-primary inline-block" />
                )}
              </TabsTrigger>
              <TabsTrigger value="notes">
                Notes
                {candidate.notes && (
                  <span className="ml-1.5 h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW */}
            <TabsContent value="overview" className="space-y-6 mt-4">
              {/* Contact Information Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${candidate.candidateEmail}`}
                        className="text-primary hover:underline"
                      >
                        {candidate.candidateEmail}
                      </a>
                    </div>
                    {candidate.candidatePhone && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={`tel:${candidate.candidatePhone}`}
                          className="hover:underline"
                        >
                          {candidate.candidatePhone}
                        </a>
                      </div>
                    )}
                    {candidate.candidateLocation && (
                      <div className="flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{candidate.candidateLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Background & Links
                  </h4>
                  <div className="space-y-2 text-sm">
                    {candidate.education && (
                      <div className="flex items-start gap-2 text-foreground">
                        <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>{candidate.education}</span>
                      </div>
                    )}
                    {candidate.portfolioUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={candidate.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          {candidate.portfolioUrl.replace(/^https?:\/\//, "")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {candidate.linkedinUrl && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={candidate.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          LinkedIn Profile
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Skills & Core Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills && candidate.skills.length > 0 ? (
                    candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No specific skills listed.</span>
                  )}
                </div>
              </div>

              {/* Quick Pipeline Progress */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
                  <span>Hiring Pipeline Stage</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    Current: {candidate.status}
                  </span>
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {(["new", "screening", "interview", "offered", "rejected"] as ApplicationStatus[]).map((st) => {
                    const isActive = candidate.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`text-xs py-2 px-1 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: APPLICATION & RESUME */}
            <TabsContent value="application" className="space-y-6 mt-4">
              {/* Job Info Banner */}
              <div className="p-4 rounded-xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Application submitted for</p>
                  <h4 className="text-base font-semibold text-foreground">
                    {candidate.jobTitle || "Job Listing"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {candidate.jobDepartment} • {candidate.jobEmploymentType} • {candidate.jobLocation}
                  </p>
                </div>
                {candidate.resumeUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Resume
                    </a>
                  </Button>
                )}
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Cover Letter / Introduction
                </h4>
                <div className="p-4 rounded-xl border bg-card text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {candidate.coverLetter || "No cover letter submitted."}
                </div>
              </div>

              {/* Resume Card */}
              <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-foreground">
                      {candidate.candidateName.replace(/\s+/g, "_")}_Resume.pdf
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Attached resume document
                    </p>
                  </div>
                </div>
                {candidate.resumeUrl ? (
                  <Button size="sm" variant="secondary" asChild>
                    <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </Button>
                ) : (
                  <Badge variant="outline">On File</Badge>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: INTERVIEW */}
            <TabsContent value="interview" className="space-y-6 mt-4">
              {candidate.interviewDate ? (
                <div className="p-5 rounded-xl border bg-primary/5 border-primary/20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-primary text-primary-foreground mb-2">
                        Interview Scheduled
                      </Badge>
                      <h4 className="text-lg font-bold text-foreground">
                        {new Date(candidate.interviewDate).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Time:{" "}
                        <span className="font-semibold text-foreground">
                          {new Date(candidate.interviewDate).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onScheduleInterviewClick(candidate)}
                    >
                      Reschedule
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-primary/10 text-sm">
                    <div>
                      <span className="text-muted-foreground">Format / Medium: </span>
                      <span className="font-medium text-foreground">
                        {candidate.interviewType || "Video Call"}
                      </span>
                    </div>
                    {candidate.interviewNotes && (
                      <div>
                        <span className="text-muted-foreground">Meeting Details & Instructions: </span>
                        <div className="mt-1 p-3 rounded-lg bg-card border text-foreground text-xs leading-relaxed">
                          {candidate.interviewNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border rounded-xl bg-muted/20 space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-foreground">No interview scheduled yet</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Select a date, time, and interview format to invite this candidate to an interview.
                  </p>
                  <Button
                    onClick={() => onScheduleInterviewClick(candidate)}
                    className="mt-2"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* TAB 4: PRIVATE NOTES */}
            <TabsContent value="notes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">
                    Internal Employer Evaluation Notes
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Visible only to your hiring team
                  </span>
                </div>
                <Textarea
                  rows={6}
                  placeholder="Record observations, strengths, potential concerns, compensation expectations, or next steps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotes} disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Evaluation Notes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-card flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`mailto:${candidate.candidateEmail}`}>
                <Mail className="h-4 w-4 mr-2" />
                Email Candidate
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScheduleInterviewClick(candidate)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {candidate.interviewDate ? "Reschedule" : "Schedule Interview"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {nextStage && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleStatusChange(nextStage)}
                disabled={isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Advance to {nextStage.charAt(0).toUpperCase() + nextStage.slice(1)}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
