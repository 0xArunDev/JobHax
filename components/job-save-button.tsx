"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { saveJob, unsaveJob, checkJobStatus } from "@/features/candidate-features/candidate.actions"
import { toast } from "sonner"

export function JobSaveButton({ 
    jobId, 
    isAuthenticated,
    isApplicant
}: { 
    jobId: number;
    isAuthenticated: boolean;
    isApplicant: boolean;
}) {
    const [isPending, startTransition] = useTransition()
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
        if (isAuthenticated && isApplicant) {
            checkJobStatus(jobId).then((res) => {
                if (res.status === "SUCCESS" && res.data) {
                    setIsSaved(res.data.isSaved);
                }
            });
        }
    }, [jobId, isAuthenticated, isApplicant]);

    const handleSaveToggle = (e: React.MouseEvent) => {
        e.preventDefault(); // prevent triggering Link navigation if wrapped in a card link
        
        if (!isAuthenticated) {
            toast.error("Please login to save jobs");
            return;
        }
        if (!isApplicant) {
            toast.error("Only applicants can save jobs");
            return;
        }

        startTransition(async () => {
            const res = isSaved ? await unsaveJob(jobId) : await saveJob(jobId);
            if (res.status === "SUCCESS") {
                toast.success(res.message);
                setIsSaved(!isSaved);
            } else {
                toast.error(res.message);
            }
        });
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSaveToggle}
            disabled={isPending}
            className={`shrink-0 ${isSaved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
            <span className="sr-only">{isSaved ? "Unsave Job" : "Save Job"}</span>
        </Button>
    )
}
