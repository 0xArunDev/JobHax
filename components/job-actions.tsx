"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, Share2 } from "lucide-react"
import Link from "next/link"
import { saveJob, unsaveJob, checkJobStatus } from "@/features/candidate-features/candidate.actions"
import { toast } from "sonner"
import { ApplyJobDialog } from "@/components/apply-job-dialog"

export function JobActions({ 
    jobId, 
    jobTitle,
    employerName,
    isAuthenticated,
    isApplicant
}: { 
    jobId: number;
    jobTitle: string;
    employerName: string;
    isAuthenticated: boolean;
    isApplicant: boolean;
}) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState<{ isSaved: boolean; isApplied: boolean }>({ isSaved: false, isApplied: false })
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)

    useEffect(() => {
        if (isAuthenticated && isApplicant) {
            checkJobStatus(jobId).then((res) => {
                if (res.status === "SUCCESS" && res.data) {
                    setStatus(res.data);
                }
            });
        }
    }, [jobId, isAuthenticated, isApplicant]);

    const handleSaveToggle = () => {
        if (!isAuthenticated) {
            toast.error("Please login to save jobs");
            return;
        }
        if (!isApplicant) {
            toast.error("Only applicants can save jobs");
            return;
        }

        startTransition(async () => {
            const res = status.isSaved ? await unsaveJob(jobId) : await saveJob(jobId);
            if (res.status === "SUCCESS") {
                toast.success(res.message);
                setStatus(prev => ({ ...prev, isSaved: !prev.isSaved }));
            } else {
                toast.error(res.message);
            }
        });
    }

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            toast.error("Please login to apply");
            window.location.href = "/login";
            return;
        }
        if (!isApplicant) {
            toast.error("Only applicants can apply to jobs");
            return;
        }
        setIsApplyDialogOpen(true);
    }

    return (
        <>
            <div className="flex gap-2 shrink-0">
                <Button 
                    variant={status.isSaved ? "default" : "outline"} 
                    size="icon" 
                    onClick={handleSaveToggle}
                    disabled={isPending}
                >
                    <Bookmark className={`h-4 w-4 ${status.isSaved ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => toast.success("Link copied to clipboard")}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
            
            {/* The main Apply button is usually rendered separately in the sidebar, but we can expose it here or pass the state up. Actually, we can just export a generic ApplyButton component as well. */}
            <ApplyJobDialog 
                open={isApplyDialogOpen}
                onOpenChange={setIsApplyDialogOpen}
                job={{ id: jobId, title: jobTitle, employerName }}
                onApplicationSubmitted={() => setStatus(prev => ({ ...prev, isApplied: true }))}
            />
        </>
    )
}

export function ApplyButton({ 
    jobId, 
    jobTitle,
    employerName,
    isAuthenticated,
    isApplicant 
}: { 
    jobId: number;
    jobTitle: string;
    employerName: string;
    isAuthenticated: boolean;
    isApplicant: boolean;
}) {
    const [status, setStatus] = useState<{ isSaved: boolean; isApplied: boolean }>({ isSaved: false, isApplied: false })
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)

    useEffect(() => {
        if (isAuthenticated && isApplicant) {
            checkJobStatus(jobId).then((res) => {
                if (res.status === "SUCCESS" && res.data) {
                    setStatus(res.data);
                }
            });
        }
    }, [jobId, isAuthenticated, isApplicant]);

    const handleApplyClick = () => {
        if (!isAuthenticated) {
            window.location.href = "/login";
            return;
        }
        if (!isApplicant) {
            toast.error("Only applicants can apply to jobs");
            return;
        }
        setIsApplyDialogOpen(true);
    }

    return (
        <>
            {status.isApplied ? (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled>
                    Applied
                </Button>
            ) : (
                <Button className="w-full" size="lg" onClick={handleApplyClick}>
                    Apply for this Job
                </Button>
            )}

            {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground mt-4">
                    You need to <Link href="/login" className="text-primary hover:underline">sign in</Link> or{" "}
                    <Link href="/register" className="text-primary hover:underline">create an account</Link> to apply
                </p>
            )}

            <ApplyJobDialog 
                open={isApplyDialogOpen}
                onOpenChange={setIsApplyDialogOpen}
                job={{ id: jobId, title: jobTitle, employerName }}
                onApplicationSubmitted={() => setStatus(prev => ({ ...prev, isApplied: true }))}
            />
        </>
    )
}
