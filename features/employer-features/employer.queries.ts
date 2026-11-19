import { db } from "@/src/config/db";
import { employers, jobs, jobApplications, conversations, messages, users } from "@/src/drizzle/schema";
import { getCurrentUser } from "../auth/server/auth.queries";
import { eq, desc, asc } from "drizzle-orm";

export const getCurrentEmployerDetails = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser) return null;

    if (currentUser.role !== "employer") return null;

    const [employer] = await db
        .select()
        .from(employers)
        .where(eq(employers.id, currentUser.id));

    const isProfileCompleted =
        employer?.name &&
        employer?.description &&
        employer?.industry &&
        employer?.teamSize &&
        employer?.websiteUrl &&
        employer?.location &&
        employer?.yearOfEstablishment;

    return { ...currentUser, employerDetails: employer, isProfileCompleted };
};

const defaultNotificationPreferences = {
    newApplications: true,
    applicationUpdates: true,
    weeklyReports: true,
    productUpdates: false,
};

export const getEmployerSettingsData = async () => {
    const details = await getCurrentEmployerDetails();
    if (!details) return null;

    const employerJobs = await getEmployerJobs();
    const savedNotifications = details.employerDetails?.metadata?.notifications;

    return {
        account: {
            name: details.name,
            userName: details.userName,
            email: details.email,
            phoneNumber: details.phoneNumber ?? "",
            companyName: details.employerDetails?.name ?? "",
        },
        notifications: {
            ...defaultNotificationPreferences,
            ...savedNotifications,
        },
        plan: {
            id: "starter" as const,
            name: "Starter",
            priceLabel: "Free",
            activeJobs: employerJobs.filter((job) => job.status === "published").length,
            totalJobs: employerJobs.length,
        },
    };
};

export const getEmployerJobs = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "employer") return [];

    const employerJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.employerId, currentUser.id))
        .orderBy(desc(jobs.createdAt));

    return employerJobs;
};

export const getEmployerCandidatesData = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "employer") {
        return null;
    }

    // 1. Fetch all employer jobs
    const employerJobs = await db
        .select()
        .from(jobs)
        .where(eq(jobs.employerId, currentUser.id))
        .orderBy(desc(jobs.createdAt));

    if (employerJobs.length === 0) {
        return {
            employer: currentUser,
            jobs: [],
            candidates: [],
            counts: {
                total: 0,
                starred: 0,
                new: 0,
                screening: 0,
                interview: 0,
                offered: 0,
                rejected: 0,
            }
        };
    }

    // 2. Fetch all applications for employer's jobs
    const applications = await db
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
            jobDepartment: jobs.department,
            jobLocation: jobs.location,
            jobEmploymentType: jobs.employmentType,
        })
        .from(jobApplications)
        .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
        .where(eq(jobs.employerId, currentUser.id))
        .orderBy(desc(jobApplications.appliedAt));

    const counts = {
        total: applications.length,
        starred: applications.filter(a => a.isStarred).length,
        new: applications.filter(a => a.status === "new").length,
        screening: applications.filter(a => a.status === "screening").length,
        interview: applications.filter(a => a.status === "interview").length,
        offered: applications.filter(a => a.status === "offered").length,
        rejected: applications.filter(a => a.status === "rejected").length,
    };

    return {
        employer: currentUser,
        jobs: employerJobs,
        candidates: applications,
        counts,
    };
};

export const getEmployerConversations = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "employer") return [];

    const employerConversations = await db
        .select({
            id: conversations.id,
            applicationId: conversations.applicationId,
            lastMessageAt: conversations.lastMessageAt,
            applicantName: jobApplications.candidateName,
            applicantTitle: jobApplications.candidateTitle,
            applicationStatus: jobApplications.status,
            applicantAvatar: users.avatarUrl,
        })
        .from(conversations)
        .innerJoin(jobApplications, eq(conversations.applicationId, jobApplications.id))
        .leftJoin(users, eq(jobApplications.applicantId, users.id))
        .where(eq(conversations.employerId, currentUser.id))
        .orderBy(desc(conversations.lastMessageAt));

    // Get latest message for each conversation
    const conversationsWithLastMessage = await Promise.all(
        employerConversations.map(async (conv) => {
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
                unreadCount: 0, // Hardcoded for now
            };
        })
    );

    return conversationsWithLastMessage;
};

export const getConversationMessages = async (conversationId: number) => {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "employer") return [];

    const conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

    return conversationMessages;
};


