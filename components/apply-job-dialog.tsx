"use client"

import { useState, useTransition } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { applyToJob } from "@/features/candidate-features/candidate.actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ApplyJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: { id: number; title: string; employerName: string };
    onApplicationSubmitted: () => void;
}

export function ApplyJobDialog({ open, onOpenChange, job, onApplicationSubmitted }: ApplyJobDialogProps) {
    const [isPending, startTransition] = useTransition()
    
    const [formData, setFormData] = useState({
        coverLetter: "",
        resumeUrl: "",
        portfolioUrl: "",
        linkedinUrl: "",
    })

    const handleSubmit = () => {
        startTransition(async () => {
            const res = await applyToJob({
                jobId: job.id,
                coverLetter: formData.coverLetter || undefined,
                resumeUrl: formData.resumeUrl || undefined,
                portfolioUrl: formData.portfolioUrl || undefined,
                linkedinUrl: formData.linkedinUrl || undefined,
            });
            
            if (res.status === "SUCCESS") {
                toast.success(res.message);
                onApplicationSubmitted();
                onOpenChange(false);
            } else {
                toast.error(res.message);
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Apply for {job.title}</DialogTitle>
                    <DialogDescription>
                        at {job.employerName}. Your profile details will be included automatically.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                        <Textarea 
                            id="coverLetter"
                            placeholder="Introduce yourself and explain why you're a great fit..."
                            rows={4}
                            value={formData.coverLetter}
                            onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="resumeUrl">Resume URL (Optional)</Label>
                        <Input 
                            id="resumeUrl"
                            placeholder="https://link-to-your-resume.pdf"
                            value={formData.resumeUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
                        <Input 
                            id="portfolioUrl"
                            placeholder="https://yourportfolio.com"
                            value={formData.portfolioUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                        <Input 
                            id="linkedinUrl"
                            placeholder="linkedin.com/in/username"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        />
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
