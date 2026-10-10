import { db } from "@/src/config/db";
import { applicants, employers, jobs, jobApplications, savedJobs, conversations, messages } from "@/src/drizzle/schema";
import { getCurrentUser } from "../auth/server/auth.queries";
import { eq, desc, asc, and } from "drizzle-orm";

export const getCurrentApplicantDetails = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) return null;
    if (currentUser.role !== "applicant") return null;

    const [applicant] = await db
        .select()
        .from(applicants)
        .where(eq(applicants.id, currentUser.id));

    const isProfileCompleted = !!(
        applicant?.biography &&
        applicant?.location &&
        applicant?.education &&
        applicant?.experience
    );

    return { ...currentUser, applicantDetails: applicant, isProfileCompleted };
};

export const getApplicantApplications = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "applicant") return [];

    return await db
        .select({
            id: jobApplications.id,
            jobId: jobApplications.jobId,
            applicantId: jobApplications.applicantId,
            candidateName: jobApplications.candidateName,
            candidateEmail: jobApplications.candidateEmail,
            candidatePhone: jobApplications.candidatePhone,
            candidateLocation: jobApplications.candidateLocation,
            candidateTitle: jobApplications.candidateTitle,
            experience: jobApplications.experience,
            education: jobApplications.education,
            skills: jobApplications.skills,
            resumeUrl: jobApplications.resumeUrl,
            coverLetter: jobApplications.coverLetter,
            portfolioUrl: jobApplications.portfolioUrl,
            linkedinUrl: jobApplications.linkedinUrl,
            status: jobApplications.status,
            isStarred: jobApplications.isStarred,
            matchScore: jobApplications.matchScore,
            interviewDate: jobApplications.interviewDate,
            interviewType: jobApplications.interviewType,
            interviewNotes: jobApplications.interviewNotes,
            notes: jobApplications.notes,
            appliedAt: jobApplications.appliedAt,
            updatedAt: jobApplications.updatedAt,
            jobTitle: jobs.title,
            jobLocation: jobs.location,
            jobEmploymentType: jobs.employmentType,
            jobSalaryMin: jobs.salaryMin,
            jobSalaryMax: jobs.salaryMax,
            jobDepartment: jobs.department,
            jobWorkplaceType: jobs.workplaceType,
            jobStatus: jobs.status,
            employerName: employers.name,
            employerLocation: employers.location,
        })
        .from(jobApplications)
        .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
        .innerJoin(employers, eq(jobs.employerId, employers.id))
        .where(eq(jobApplications.applicantId, currentUser.id))
        .orderBy(desc(jobApplications.appliedAt));
};

export const getApplicantSavedJobs = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "applicant") return [];

    return await db
        .select({
            id: savedJobs.id,
            jobId: savedJobs.jobId,
            savedAt: savedJobs.savedAt,
            jobTitle: jobs.title,
            jobLocation: jobs.location,
            jobEmploymentType: jobs.employmentType,
            jobSalaryMin: jobs.salaryMin,
            jobSalaryMax: jobs.salaryMax,
            jobSkills: jobs.skills,
            jobCreatedAt: jobs.createdAt,
            jobStatus: jobs.status,
            jobWorkplaceType: jobs.workplaceType,
            employerName: employers.name,
        })
        .from(savedJobs)
        .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
        .innerJoin(employers, eq(jobs.employerId, employers.id))
        .where(eq(savedJobs.applicantId, currentUser.id))
        .orderBy(desc(savedJobs.savedAt));
};

export const getApplicantDashboardStats = async () => {
    const userDetails = await getCurrentApplicantDetails();
    if (!userDetails) return null;

    const applications = await getApplicantApplications();
    const saved = await getApplicantSavedJobs();

    const counts = {
        totalApplications: applications.length,
        pending: applications.filter(a => a.status === "new").length,
        screening: applications.filter(a => a.status === "screening").length,
        interview: applications.filter(a => a.status === "interview").length,
        offered: applications.filter(a => a.status === "offered").length,
        rejected: applications.filter(a => a.status === "rejected").length,
        savedJobs: saved.length,
    };

    return {
        user: userDetails,
        applications,
        savedJobs: saved,
        counts,
    };
};

export const getApplicantConversations = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "applicant") return [];

    const applicantConversations = await db
        .select({
            id: conversations.id,
            applicationId: conversations.applicationId,
            employerId: conversations.employerId,
            lastMessageAt: conversations.lastMessageAt,
            applicantLastReadAt: conversations.applicantLastReadAt,
            employerName: employers.name,
            jobTitle: jobs.title,
        })
        .from(conversations)
        .innerJoin(jobApplications, eq(conversations.applicationId, jobApplications.id))
        .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
        .innerJoin(employers, eq(conversations.employerId, employers.id))
        .where(eq(jobApplications.applicantId, currentUser.id))
        .orderBy(desc(conversations.lastMessageAt));

    // Get latest message for each conversation
    const conversationsWithLastMessage = await Promise.all(
        applicantConversations.map(async (conv) => {
            const [lastMessage] = await db
                .select()
                .from(messages)
                .where(eq(messages.conversationId, conv.id))
                .orderBy(desc(messages.createdAt))
                .limit(1);

            return {
                ...conv,
                lastMessage: lastMessage?.body || "",
                lastMessageTime: lastMessage?.createdAt,
                unreadCount: 0,
            };
        })
    );

    return conversationsWithLastMessage;
};

export const getApplicantConversationMessages = async (conversationId: number) => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "applicant") return [];

    // Verify the applicant owns this conversation (through jobApplications.applicantId)
    const [conv] = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(jobApplications, eq(conversations.applicationId, jobApplications.id))
        .where(
            and(
                eq(conversations.id, conversationId),
                eq(jobApplications.applicantId, currentUser.id)
            )
        );

    if (!conv) return [];

    return await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
};

export const getApplicantSettingsData = async () => {
    const details = await getCurrentApplicantDetails();
    if (!details) return null;

    const defaultNotifications = {
        jobMatches: true,
        applicationUpdates: true,
        interviewReminders: true,
        profileViews: false,
        marketingEmails: false,
    };

    const defaultPrivacy = {
        profileVisible: true,
        showContactInfo: true,
        openToWork: true,
    };

    const savedNotifications = details.applicantDetails?.metadata?.notifications;
    const savedPrivacy = details.applicantDetails?.metadata?.privacy;

    return {
        account: {
            name: details.name,
            userName: details.userName,
            email: details.email,
            phoneNumber: details.phoneNumber ?? "",
        },
        notifications: {
            ...defaultNotifications,
            ...savedNotifications,
        },
        privacy: {
            ...defaultPrivacy,
            ...savedPrivacy,
        },
    };
};

/**
 * Get recommended jobs for the applicant: published jobs not already applied to.
 */
export const getRecommendedJobs = async (limit = 5) => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "applicant") return [];

    // Get IDs of jobs the applicant already applied to
    const appliedJobIds = await db
        .select({ jobId: jobApplications.jobId })
        .from(jobApplications)
        .where(eq(jobApplications.applicantId, currentUser.id));

    const appliedIds = appliedJobIds.map(a => a.jobId);

    // Fetch published jobs, excluding already-applied ones
    const allPublishedJobs = await db
        .select({
            id: jobs.id,
            title: jobs.title,
            location: jobs.location,
            employmentType: jobs.employmentType,
            salaryMin: jobs.salaryMin,
            salaryMax: jobs.salaryMax,
            skills: jobs.skills,
            workplaceType: jobs.workplaceType,
            createdAt: jobs.createdAt,
            employerName: employers.name,
        })
        .from(jobs)
        .innerJoin(employers, eq(jobs.employerId, employers.id))
        .where(eq(jobs.status, "published"))
        .orderBy(desc(jobs.createdAt));

    // Filter out applied jobs client-side (simpler than complex SQL NOT IN for small datasets)
    const recommendedJobs = allPublishedJobs
        .filter(job => !appliedIds.includes(job.id))
        .slice(0, limit);

    return recommendedJobs;
};
