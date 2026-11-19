"use server";
import { db } from "@/src/config/db";
import { getCurrentUser } from "../auth/server/auth.queries";
import {
    postJobType,
    PostJobType,
    updateCompanyProfileData,
    UpdateCompanyProfileData,
    updateEmployerAccountSchema,
    UpdateEmployerAccountData,
    changeEmployerPasswordSchema,
    ChangeEmployerPasswordData,
    employerNotificationPreferencesSchema,
    EmployerNotificationPreferencesData,
    sendEmployerMessageSchema,
    SendEmployerMessageData,
} from "./employer.schema";
import { employers, jobs, users, jobApplications, conversations, messages, ApplicationStatus } from "@/src/drizzle/schema";
import { eq, and, ne, or, asc } from "drizzle-orm";
import argon2 from "argon2";
import { getEmployerJobs, getEmployerCandidatesData } from "./employer.queries";


export const updateEmployerProfile = async (data: UpdateCompanyProfileData) => {
    try {
        const { data: validatedData, error } = updateCompanyProfileData.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }
        const { avatarUrl, ...rest } = validatedData;
        if (avatarUrl != currentUser.avatarUrl) {
            await db.update(users).set({ avatarUrl }).where(eq(users.id, currentUser.id));
        }
        await db.update(employers).set(rest).where(eq(employers.id, currentUser.id));
        return { status: "SUCCESS", message: "Company profile updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update company profile" };
    }
}

export const updateEmployerAccount = async (data: UpdateEmployerAccountData) => {
    try {
        const { data: validatedData, error } = updateEmployerAccountSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [conflict] = await db
            .select({ id: users.id, email: users.email, userName: users.userName })
            .from(users)
            .where(
                and(
                    ne(users.id, currentUser.id),
                    or(
                        eq(users.email, validatedData.email),
                        eq(users.userName, validatedData.userName),
                    ),
                ),
            );

        if (conflict) {
            if (conflict.email === validatedData.email) {
                return { status: "ERROR", message: "Email already exists" };
            }
            return { status: "ERROR", message: "Username already exists" };
        }

        await db
            .update(users)
            .set({
                name: validatedData.name,
                userName: validatedData.userName,
                email: validatedData.email,
                phoneNumber: validatedData.phoneNumber || null,
            })
            .where(eq(users.id, currentUser.id));

        return { status: "SUCCESS", message: "Account updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update account" };
    }
};

export const changeEmployerPassword = async (data: ChangeEmployerPasswordData) => {
    try {
        const { data: validatedData, error } = changeEmployerPasswordSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [user] = await db
            .select({ password: users.password })
            .from(users)
            .where(eq(users.id, currentUser.id));

        if (!user) return { status: "ERROR", message: "User not found" };

        const isPasswordValid = await argon2.verify(user.password, validatedData.currentPassword);
        if (!isPasswordValid) {
            return { status: "ERROR", message: "Current password is incorrect" };
        }

        await db
            .update(users)
            .set({ password: await argon2.hash(validatedData.newPassword) })
            .where(eq(users.id, currentUser.id));

        return { status: "SUCCESS", message: "Password updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update password" };
    }
};

export const updateEmployerNotificationPreferences = async (
    data: EmployerNotificationPreferencesData,
) => {
    try {
        const { data: validatedData, error } = employerNotificationPreferencesSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [employer] = await db
            .select({ metadata: employers.metadata })
            .from(employers)
            .where(eq(employers.id, currentUser.id));

        if (!employer) return { status: "ERROR", message: "Employer not found" };

        await db
            .update(employers)
            .set({
                metadata: {
                    ...employer.metadata,
                    notifications: validatedData,
                },
            })
            .where(eq(employers.id, currentUser.id));

        return { status: "SUCCESS", message: "Notification preferences saved" };
    } catch {
        return { status: "ERROR", message: "Failed to save notification preferences" };
    }
};

export const postJob = async (data: PostJobType) => {
    try {
        const { data: validatedData, error } = postJobType.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        await db.insert(jobs).values({ ...validatedData, employerId: currentUser.id });
        return { status: "SUCCESS", message: "Job posted successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to post a job" };
    }
}

export const updateJobStatus = async (jobId: number, status: "draft" | "published" | "paused" | "closed") => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [job] = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.employerId, currentUser.id)));
        if (!job) {
            return { status: "ERROR", message: "Job not found" };
        }

        await db.update(jobs).set({ status }).where(eq(jobs.id, jobId));
        return { status: "SUCCESS", message: `Job status updated to ${status}` };
    } catch {
        return { status: "ERROR", message: "Failed to update job status" };
    }
}

export const deleteJob = async (jobId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [job] = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.employerId, currentUser.id)));
        if (!job) {
            return { status: "ERROR", message: "Job not found" };
        }

        await db.delete(jobs).where(eq(jobs.id, jobId));
        return { status: "SUCCESS", message: "Job deleted successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to delete job" };
    }
}

export const duplicateJob = async (jobId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [existingJob] = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.employerId, currentUser.id)));
        if (!existingJob) {
            return { status: "ERROR", message: "Job not found" };
        }

        // Exclude id/timestamps from the copy so they aren't re-inserted
        const { id, createdAt, updatedAt, ...rest } = existingJob;
        await db.insert(jobs).values({
            ...rest,
            title: `${existingJob.title} - Copy`,
            status: "draft"
        });

        return { status: "SUCCESS", message: "Job duplicated successfully as draft" };
    } catch {
        return { status: "ERROR", message: "Failed to duplicate job" };
    }
}

export const updateJob = async (jobId: number, data: PostJobType) => {
    try {
        const { data: validatedData, error } = postJobType.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [job] = await db.select().from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.employerId, currentUser.id)));
        if (!job) {
            return { status: "ERROR", message: "Job not found" };
        }

        await db.update(jobs).set(validatedData).where(eq(jobs.id, jobId));
        return { status: "SUCCESS", message: "Job updated successfully" };
    } catch {
        return { status: "ERROR", message: "Failed to update job" };
    }
}

export const fetchEmployerJobsAction = async () => {
    try {
        const jobsList = await getEmployerJobs();
        return { status: "SUCCESS", data: jobsList };
    } catch {
        return { status: "ERROR", message: "Failed to fetch jobs", data: [] };
    }
}

// ---------------- CANDIDATE ACTIONS ---------------- //

export const fetchEmployerCandidatesAction = async () => {
    try {
        const candidatesData = await getEmployerCandidatesData();
        if (!candidatesData) {
            return { status: "ERROR", message: "Unauthorized or employer not found" };
        }
        return { status: "SUCCESS", data: candidatesData };
    } catch {
        return { status: "ERROR", message: "Failed to fetch candidates" };
    }
}

export const updateCandidateStatusAction = async (
    applicationId: number,
    status: ApplicationStatus
) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Verify application belongs to one of this employer's jobs
        const [app] = await db
            .select({ id: jobApplications.id, candidateName: jobApplications.candidateName })
            .from(jobApplications)
            .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
            .where(and(eq(jobApplications.id, applicationId), eq(jobs.employerId, currentUser.id)));

        if (!app) {
            return { status: "ERROR", message: "Candidate application not found" };
        }

        await db
            .update(jobApplications)
            .set({ status })
            .where(eq(jobApplications.id, applicationId));

        return {
            status: "SUCCESS",
            message: `Updated status for ${app.candidateName} to ${status.charAt(0).toUpperCase() + status.slice(1)}`
        };
    } catch {
        return { status: "ERROR", message: "Failed to update candidate status" };
    }
}

export const toggleCandidateStarredAction = async (applicationId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [app] = await db
            .select({
                id: jobApplications.id,
                isStarred: jobApplications.isStarred,
                candidateName: jobApplications.candidateName,
            })
            .from(jobApplications)
            .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
            .where(and(eq(jobApplications.id, applicationId), eq(jobs.employerId, currentUser.id)));

        if (!app) {
            return { status: "ERROR", message: "Candidate application not found" };
        }

        const nextStarred = !app.isStarred;
        await db
            .update(jobApplications)
            .set({ isStarred: nextStarred })
            .where(eq(jobApplications.id, applicationId));

        return {
            status: "SUCCESS",
            isStarred: nextStarred,
            message: nextStarred ? `Shortlisted ${app.candidateName}` : `Removed star for ${app.candidateName}`
        };
    } catch {
        return { status: "ERROR", message: "Failed to update shortlist status" };
    }
}

export const scheduleInterviewAction = async (
    applicationId: number,
    interviewDate: string,
    interviewType: string,
    interviewNotes?: string
) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [app] = await db
            .select({ id: jobApplications.id, status: jobApplications.status, candidateName: jobApplications.candidateName })
            .from(jobApplications)
            .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
            .where(and(eq(jobApplications.id, applicationId), eq(jobs.employerId, currentUser.id)));

        if (!app) {
            return { status: "ERROR", message: "Candidate application not found" };
        }

        const parsedDate = new Date(interviewDate);

        await db
            .update(jobApplications)
            .set({
                interviewDate: parsedDate,
                interviewType,
                interviewNotes: interviewNotes || null,
                status: "interview" // Automatically move to interview stage
            })
            .where(eq(jobApplications.id, applicationId));

        return {
            status: "SUCCESS",
            message: `Interview scheduled with ${app.candidateName}`
        };
    } catch {
        return { status: "ERROR", message: "Failed to schedule interview" };
    }
}

export const updateCandidateNotesAction = async (
    applicationId: number,
    notes: string
) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [app] = await db
            .select({ id: jobApplications.id })
            .from(jobApplications)
            .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
            .where(and(eq(jobApplications.id, applicationId), eq(jobs.employerId, currentUser.id)));

        if (!app) {
            return { status: "ERROR", message: "Candidate application not found" };
        }

        await db
            .update(jobApplications)
            .set({ notes })
            .where(eq(jobApplications.id, applicationId));

        return { status: "SUCCESS", message: "Candidate notes saved" };
    } catch {
        return { status: "ERROR", message: "Failed to save notes" };
    }
}

export const deleteCandidateApplicationAction = async (applicationId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [app] = await db
            .select({ id: jobApplications.id, candidateName: jobApplications.candidateName })
            .from(jobApplications)
            .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
            .where(and(eq(jobApplications.id, applicationId), eq(jobs.employerId, currentUser.id)));

        if (!app) {
            return { status: "ERROR", message: "Candidate application not found" };
        }

        await db.delete(jobApplications).where(eq(jobApplications.id, applicationId));

        return { status: "SUCCESS", message: `Application for ${app.candidateName} removed` };
    } catch {
        return { status: "ERROR", message: "Failed to remove candidate application" };
    }
}

export const seedDemoCandidatesAction = async (targetJobId?: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Find available job for this employer
        let jobId = targetJobId;
        if (!jobId) {
            const [firstJob] = await db
                .select()
                .from(jobs)
                .where(eq(jobs.employerId, currentUser.id))
                .limit(1);

            if (!firstJob) {
                // If employer has no job yet, create one so candidates have a job to attach to
                const [inserted] = await db.insert(jobs).values({
                    employerId: currentUser.id,
                    title: "Senior Full Stack Engineer",
                    department: "engineering",
                    employmentType: "full-time",
                    location: "San Francisco, CA (Remote Option)",
                    workplaceType: "hybrid",
                    salaryMin: 130000,
                    salaryMax: 175000,
                    experienceLevel: "senior",
                    description: "We are seeking a talented Senior Full Stack Engineer to lead web application development.",
                    requirements: "5+ years experience in React, TypeScript, Node.js, and SQL.",
                    skills: ["React", "TypeScript", "Node.js", "MySQL", "Next.js"],
                    status: "published"
                });
                jobId = Number(inserted.insertId);
            } else {
                jobId = Number(firstJob.id);
            }
        }

        // Demo candidates data
        const demoCandidates = [
            {
                jobId,
                candidateName: "Sarah Johnson",
                candidateEmail: "sarah.johnson@example.com",
                candidatePhone: "+1 (555) 234-5678",
                candidateLocation: "San Francisco, CA",
                candidateTitle: "Senior Frontend Developer",
                experience: "5 years",
                education: "B.S. in Computer Science, Stanford University",
                skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux"],
                resumeUrl: "https://jobhax.com/resumes/sarah-johnson.pdf",
                coverLetter: "I have over 5 years of production experience crafting performant web applications using React, TypeScript, and modern design systems. I would love to bring my expertise to your growing engineering team.",
                portfolioUrl: "https://github.com/sarah-johnson-dev",
                linkedinUrl: "https://linkedin.com/in/sarahjohnson-dev",
                status: "new" as const,
                isStarred: true,
                matchScore: 96,
                notes: "Strong frontend profile, exceptional portfolio projects.",
            },
            {
                jobId,
                candidateName: "Michael Chen",
                candidateEmail: "michael.chen@example.com",
                candidatePhone: "+1 (555) 345-6789",
                candidateLocation: "New York, NY",
                candidateTitle: "Full Stack Developer",
                experience: "4 years",
                education: "B.Tech in Information Systems",
                skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
                resumeUrl: "https://jobhax.com/resumes/michael-chen.pdf",
                coverLetter: "Hi there! I am passionate about building scalable microservices and snappy user interfaces. Having led backend refactors in my last startup, I am confident I can hit the ground running.",
                portfolioUrl: "https://michaelchen.dev",
                linkedinUrl: "https://linkedin.com/in/michael-chen-swe",
                status: "screening" as const,
                isStarred: false,
                matchScore: 89,
                notes: "Good balance of backend and frontend skills. Waiting for phone screening feedback.",
            },
            {
                jobId,
                candidateName: "Emily Rodriguez",
                candidateEmail: "emily.rodriguez@example.com",
                candidatePhone: "+1 (555) 456-7890",
                candidateLocation: "Austin, TX (Remote)",
                candidateTitle: "UI/UX & Frontend Engineer",
                experience: "6 years",
                education: "B.A. in Digital Arts & Design",
                skills: ["Figma", "Design Systems", "React", "CSS/Sass", "Accessibility"],
                resumeUrl: "https://jobhax.com/resumes/emily-rodriguez.pdf",
                coverLetter: "Bridging the gap between design and high-performance frontend code is what I excel at. I have architected component libraries used by over 30 engineers.",
                portfolioUrl: "https://emilyrodriguez.design",
                linkedinUrl: "https://linkedin.com/in/emily-rodriguez-design",
                status: "interview" as const,
                isStarred: true,
                matchScore: 92,
                interviewDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
                interviewType: "Video Call (Google Meet)",
                interviewNotes: "Technical round with Lead Frontend Engineer.",
                notes: "Top candidate for UI/UX excellence. Portfolio is outstanding.",
            },
            {
                jobId,
                candidateName: "David Kim",
                candidateEmail: "david.kim@example.com",
                candidatePhone: "+1 (555) 567-8901",
                candidateLocation: "Seattle, WA",
                candidateTitle: "Cloud & DevOps Engineer",
                experience: "3 years",
                education: "B.S. in Software Engineering, UW",
                skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
                resumeUrl: "https://jobhax.com/resumes/david-kim.pdf",
                coverLetter: "Specializing in cloud infrastructure automation and container orchestration. Eager to help streamline deployment pipelines and enhance developer productivity.",
                portfolioUrl: "https://github.com/davidkim-ops",
                linkedinUrl: "https://linkedin.com/in/davidkim-cloud",
                status: "new" as const,
                isStarred: false,
                matchScore: 84,
                notes: null,
            },
            {
                jobId,
                candidateName: "Priya Sharma",
                candidateEmail: "priya.sharma@example.com",
                candidatePhone: "+1 (555) 678-9012",
                candidateLocation: "Chicago, IL",
                candidateTitle: "Staff Software Engineer",
                experience: "8 years",
                education: "M.S. in Computer Science, UIUC",
                skills: ["React", "Go", "Distributed Systems", "TypeScript", "System Design"],
                resumeUrl: "https://jobhax.com/resumes/priya-sharma.pdf",
                coverLetter: "With 8+ years leading distributed systems and frontend architectures at high-growth tech companies, I am eager to contribute to JobHax's engineering trajectory.",
                portfolioUrl: "https://priyasharma.tech",
                linkedinUrl: "https://linkedin.com/in/priya-sharma-tech",
                status: "offered" as const,
                isStarred: true,
                matchScore: 98,
                notes: "Offer extended. Waiting on decision by Friday.",
            },
            {
                jobId,
                candidateName: "Marcus Vance",
                candidateEmail: "marcus.vance@example.com",
                candidatePhone: "+1 (555) 789-0123",
                candidateLocation: "Remote",
                candidateTitle: "Junior Frontend Developer",
                experience: "1 year",
                education: "Coding Bootcamp Graduate",
                skills: ["HTML5", "CSS3", "JavaScript", "React"],
                resumeUrl: "https://jobhax.com/resumes/marcus-vance.pdf",
                coverLetter: "Excited to apply for the developer position. Enthusiastic self-starter with bootcamp background.",
                portfolioUrl: "https://marcusvance.portfolio",
                linkedinUrl: "https://linkedin.com/in/marcus-vance",
                status: "rejected" as const,
                isStarred: false,
                matchScore: 68,
                notes: "Lacks required senior-level experience for this role. Kept on file for future junior openings.",
            }
        ];

        for (const candidate of demoCandidates) {
            await db.insert(jobApplications).values(candidate);
        }

        return { status: "SUCCESS", message: `Successfully seeded ${demoCandidates.length} demo candidates!` };
    } catch (error) {
        console.error("Error seeding demo candidates:", error);
        return { status: "ERROR", message: "Failed to seed demo candidates" };
    }
}

// ---------------- ANALYTICS ACTION ---------------- //

export const fetchEmployerAnalyticsAction = async () => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Fetch all employer's jobs
        const employerJobs = await db
            .select()
            .from(jobs)
            .where(eq(jobs.employerId, currentUser.id));

        const totalJobs = employerJobs.length;
        const activeJobs = employerJobs.filter(j => j.status === "published").length;
        const draftJobs = employerJobs.filter(j => j.status === "draft").length;
        const pausedJobs = employerJobs.filter(j => j.status === "paused").length;
        const closedJobs = employerJobs.filter(j => j.status === "closed").length;

        // Extract top skills from job postings
        const allSkills: string[] = [];
        for (const job of employerJobs) {
            if (job.skills && Array.isArray(job.skills)) {
                allSkills.push(...job.skills);
            }
        }
        const skillCounts: Record<string, number> = {};
        for (const skill of allSkills) {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
        const topSkillsInDemand = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));

        if (totalJobs === 0) {
            return {
                status: "SUCCESS",
                data: {
                    employer: { name: currentUser.name, email: currentUser.email },
                    summary: {
                        totalJobs: 0, activeJobs: 0, draftJobs: 0, pausedJobs: 0, closedJobs: 0,
                        totalApplications: 0, newApplications: 0, screeningCount: 0,
                        interviewCount: 0, offeredCount: 0, rejectedCount: 0,
                        starredCount: 0, avgMatchScore: 0,
                    },
                    jobPerformance: [],
                    pipeline: { new: 0, screening: 0, interview: 0, offered: 0, rejected: 0 },
                    topSkillsInDemand: [],
                }
            };
        }

        // Fetch all applications for employer's jobs
        const applications = await db
            .select({
                id: jobApplications.id,
                jobId: jobApplications.jobId,
                status: jobApplications.status,
                isStarred: jobApplications.isStarred,
                matchScore: jobApplications.matchScore,
                appliedAt: jobApplications.appliedAt,
                jobTitle: jobs.title,
                jobStatus: jobs.status,
                jobLocation: jobs.location,
                jobEmploymentType: jobs.employmentType,
            })
            .from(jobApplications)
            .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
            .where(eq(jobs.employerId, currentUser.id));

        // Overall summary metrics
        const totalApplications = applications.length;
        const newApplications = applications.filter(a => a.status === "new").length;
        const screeningCount = applications.filter(a => a.status === "screening").length;
        const interviewCount = applications.filter(a => a.status === "interview").length;
        const offeredCount = applications.filter(a => a.status === "offered").length;
        const rejectedCount = applications.filter(a => a.status === "rejected").length;
        const starredCount = applications.filter(a => a.isStarred).length;
        const matchScores = applications.map(a => a.matchScore ?? 0).filter(s => s > 0);
        const avgMatchScore = matchScores.length
            ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
            : 0;

        // Per-job performance breakdown
        const jobPerformance = employerJobs.map(job => {
            const jobApps = applications.filter(a => a.jobId === Number(job.id));
            const jobMatchScores = jobApps.map(a => a.matchScore ?? 0).filter(s => s > 0);
            return {
                jobId: Number(job.id),
                title: job.title,
                location: job.location,
                status: job.status,
                employmentType: job.employmentType,
                totalApps: jobApps.length,
                newApps: jobApps.filter(a => a.status === "new").length,
                screeningApps: jobApps.filter(a => a.status === "screening").length,
                interviewApps: jobApps.filter(a => a.status === "interview").length,
                offeredApps: jobApps.filter(a => a.status === "offered").length,
                rejectedApps: jobApps.filter(a => a.status === "rejected").length,
                starredApps: jobApps.filter(a => a.isStarred).length,
                avgMatchScore: jobMatchScores.length
                    ? Math.round(jobMatchScores.reduce((a, b) => a + b, 0) / jobMatchScores.length)
                    : 0,
            };
        }).sort((a, b) => b.totalApps - a.totalApps);

        return {
            status: "SUCCESS",
            data: {
                employer: { name: currentUser.name, email: currentUser.email },
                summary: {
                    totalJobs, activeJobs, draftJobs, pausedJobs, closedJobs,
                    totalApplications, newApplications, screeningCount,
                    interviewCount, offeredCount, rejectedCount,
                    starredCount, avgMatchScore,
                },
                jobPerformance,
                pipeline: {
                    new: newApplications,
                    screening: screeningCount,
                    interview: interviewCount,
                    offered: offeredCount,
                    rejected: rejectedCount,
                },
                topSkillsInDemand,
            }
        };
    } catch (error) {
        console.error("fetchEmployerAnalyticsAction error:", error);
        return { status: "ERROR", message: "Failed to fetch analytics" };
    }
}

export const sendEmployerMessage = async (data: SendEmployerMessageData) => {
    try {
        const { data: validatedData, error } = sendEmployerMessageSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Insert the message and bump the conversation's read/receipt timestamps
        await db.transaction(async (tx) => {
            await tx.insert(messages).values({
                conversationId: validatedData.conversationId,
                senderRole: "employer",
                senderId: currentUser.id,
                body: validatedData.body,
            });

            await tx.update(conversations)
                .set({ lastMessageAt: new Date(), employerLastReadAt: new Date() })
                .where(eq(conversations.id, validatedData.conversationId));
        });

        return { status: "SUCCESS", message: "Message sent successfully" };
    } catch (error) {
        console.error("sendEmployerMessage error:", error);
        return { status: "ERROR", message: "Failed to send message" };
    }
}

export const getConversationMessagesAction = async (conversationId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "employer") {
            return { status: "ERROR", message: "Unauthorized", data: [] };
        }

        const conversationMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(asc(messages.createdAt));

        return { status: "SUCCESS", data: conversationMessages };
    } catch (error) {
        console.error("getConversationMessagesAction error:", error);
        return { status: "ERROR", message: "Failed to fetch messages", data: [] };
    }
}
