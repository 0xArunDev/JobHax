"use server";

import { db } from "@/src/config/db";
import { getCurrentUser } from "../auth/server/auth.queries";
import {
    updateApplicantProfileSchema,
    UpdateApplicantProfileData,
    updateCandidateAccountSchema,
    UpdateCandidateAccountData,
    changeCandidatePasswordSchema,
    ChangeCandidatePasswordData,
    applyToJobSchema,
    ApplyToJobData,
    sendCandidateMessageSchema,
    SendCandidateMessageData,
    applicantNotificationPreferencesSchema,
    ApplicantNotificationPreferencesData,
    applicantPrivacySettingsSchema,
    ApplicantPrivacySettingsData,
} from "./candidate.schema";
import {
    applicants,
    users,
    jobs,
    jobApplications,
    savedJobs,
    conversations,
    messages,
    employers,
} from "@/src/drizzle/schema";
import { eq, and, ne, or, desc } from "drizzle-orm";
import argon2 from "argon2";
import {
    getCurrentApplicantDetails,
    getApplicantApplications,
    getApplicantSavedJobs,
    getApplicantDashboardStats,
    getApplicantConversations,
    getApplicantConversationMessages,
    getApplicantSettingsData,
    getRecommendedJobs,
} from "./candidate.queries";

// ==================== PROFILE ACTIONS ==================== //

/**
 * Update applicant profile data.
 * Mirrors: updateEmployerProfile()
 */
export const updateApplicantProfile = async (data: UpdateApplicantProfileData) => {
    try {
        const { data: validatedData, error } = updateApplicantProfileSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const { avatarUrl, metadata, ...profileFields } = validatedData;

        // Update avatar on users table if changed
        if (avatarUrl !== undefined && avatarUrl !== currentUser.avatarUrl) {
            await db.update(users).set({ avatarUrl }).where(eq(users.id, currentUser.id));
        }

        // Get existing applicant for metadata merge
        const [existingApplicant] = await db
            .select({ metadata: applicants.metadata })
            .from(applicants)
            .where(eq(applicants.id, currentUser.id));

        const mergedMetadata = {
            ...existingApplicant?.metadata,
            ...metadata,
        };

        await db
            .update(applicants)
            .set({
                ...profileFields,
                dateOfBirth: profileFields.dateOfBirth ? new Date(profileFields.dateOfBirth) : undefined,
                metadata: mergedMetadata,
            })
            .where(eq(applicants.id, currentUser.id));

        return { status: "SUCCESS", message: "Profile updated successfully" };
    } catch (error) {
        console.error("updateApplicantProfile error:", error);
        return { status: "ERROR", message: "Failed to update profile" };
    }
};

// ==================== ACCOUNT ACTIONS ==================== //

/**
 * Update candidate account info (name, username, email, phone).
 * Mirrors: updateEmployerAccount()
 */
export const updateCandidateAccount = async (data: UpdateCandidateAccountData) => {
    try {
        const { data: validatedData, error } = updateCandidateAccountSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Check for username/email conflicts
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

/**
 * Change candidate password.
 * Mirrors: changeEmployerPassword()
 */
export const changeCandidatePassword = async (data: ChangeCandidatePasswordData) => {
    try {
        const { data: validatedData, error } = changeCandidatePasswordSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
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

// ==================== NOTIFICATION & PRIVACY ACTIONS ==================== //

/**
 * Update applicant notification preferences (stored in applicants.metadata.notifications).
 * Mirrors: updateEmployerNotificationPreferences()
 */
export const updateApplicantNotificationPreferences = async (
    data: ApplicantNotificationPreferencesData,
) => {
    try {
        const { data: validatedData, error } = applicantNotificationPreferencesSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [applicant] = await db
            .select({ metadata: applicants.metadata })
            .from(applicants)
            .where(eq(applicants.id, currentUser.id));

        if (!applicant) return { status: "ERROR", message: "Applicant not found" };

        await db
            .update(applicants)
            .set({
                metadata: {
                    ...applicant.metadata,
                    notifications: validatedData,
                },
            })
            .where(eq(applicants.id, currentUser.id));

        return { status: "SUCCESS", message: "Notification preferences saved" };
    } catch {
        return { status: "ERROR", message: "Failed to save notification preferences" };
    }
};

/**
 * Update applicant privacy settings (stored in applicants.metadata.privacy).
 */
export const updateApplicantPrivacySettings = async (
    data: ApplicantPrivacySettingsData,
) => {
    try {
        const { data: validatedData, error } = applicantPrivacySettingsSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [applicant] = await db
            .select({ metadata: applicants.metadata })
            .from(applicants)
            .where(eq(applicants.id, currentUser.id));

        if (!applicant) return { status: "ERROR", message: "Applicant not found" };

        await db
            .update(applicants)
            .set({
                metadata: {
                    ...applicant.metadata,
                    privacy: validatedData,
                },
            })
            .where(eq(applicants.id, currentUser.id));

        return { status: "SUCCESS", message: "Privacy settings saved" };
    } catch {
        return { status: "ERROR", message: "Failed to save privacy settings" };
    }
};

// ==================== JOB APPLICATION ACTIONS ==================== //

/**
 * Apply to a job. Auto-fills candidate info from user + applicant profile.
 */
export const applyToJob = async (data: ApplyToJobData) => {
    try {
        const { data: validatedData, error } = applyToJobSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Check job exists and is published
        const [job] = await db
            .select()
            .from(jobs)
            .where(and(eq(jobs.id, validatedData.jobId), eq(jobs.status, "published")));

        if (!job) {
            return { status: "ERROR", message: "Job not found or no longer accepting applications" };
        }

        // Check if already applied
        const [existingApp] = await db
            .select({ id: jobApplications.id })
            .from(jobApplications)
            .where(
                and(
                    eq(jobApplications.jobId, validatedData.jobId),
                    eq(jobApplications.applicantId, currentUser.id),
                ),
            );

        if (existingApp) {
            return { status: "ERROR", message: "You have already applied to this job" };
        }

        // Get applicant profile for auto-fill
        const [applicant] = await db
            .select()
            .from(applicants)
            .where(eq(applicants.id, currentUser.id));

        // Build application with auto-filled data
        await db.insert(jobApplications).values({
            jobId: validatedData.jobId,
            applicantId: currentUser.id,
            candidateName: currentUser.name,
            candidateEmail: currentUser.email,
            candidatePhone: currentUser.phoneNumber || null,
            candidateLocation: applicant?.location || null,
            candidateTitle: applicant?.metadata?.title || null,
            experience: applicant?.experience || null,
            education: applicant?.education || null,
            skills: applicant?.metadata?.skills || null,
            resumeUrl: validatedData.resumeUrl || applicant?.metadata?.resumeUrl || null,
            coverLetter: validatedData.coverLetter || null,
            portfolioUrl: validatedData.portfolioUrl || applicant?.metadata?.portfolioUrl || null,
            linkedinUrl: validatedData.linkedinUrl || applicant?.metadata?.linkedinUrl || null,
            status: "new",
            matchScore: 85, // Default match score
        });

        return { status: "SUCCESS", message: "Application submitted successfully!" };
    } catch (error) {
        console.error("applyToJob error:", error);
        return { status: "ERROR", message: "Failed to submit application" };
    }
};

/**
 * Withdraw (delete) a job application. Only the owning applicant can withdraw.
 */
export const withdrawApplication = async (applicationId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [app] = await db
            .select({ id: jobApplications.id, candidateName: jobApplications.candidateName })
            .from(jobApplications)
            .where(
                and(
                    eq(jobApplications.id, applicationId),
                    eq(jobApplications.applicantId, currentUser.id),
                ),
            );

        if (!app) {
            return { status: "ERROR", message: "Application not found" };
        }

        await db.delete(jobApplications).where(eq(jobApplications.id, applicationId));

        return { status: "SUCCESS", message: "Application withdrawn successfully" };
    } catch (error) {
        return { status: "ERROR", message: "Failed to withdraw application" };
    }
};

// ==================== SAVED JOBS ACTIONS ==================== //

/**
 * Save a job to the applicant's saved list.
 */
export const saveJob = async (jobId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Check job exists
        const [job] = await db
            .select({ id: jobs.id })
            .from(jobs)
            .where(eq(jobs.id, jobId));

        if (!job) {
            return { status: "ERROR", message: "Job not found" };
        }

        // Check if already saved
        const [existing] = await db
            .select({ id: savedJobs.id })
            .from(savedJobs)
            .where(
                and(
                    eq(savedJobs.applicantId, currentUser.id),
                    eq(savedJobs.jobId, jobId),
                ),
            );

        if (existing) {
            return { status: "ERROR", message: "Job already saved" };
        }

        await db.insert(savedJobs).values({
            applicantId: currentUser.id,
            jobId,
        });

        return { status: "SUCCESS", message: "Job saved!" };
    } catch (error) {
        return { status: "ERROR", message: "Failed to save job" };
    }
};

/**
 * Remove a job from the applicant's saved list.
 */
export const unsaveJob = async (jobId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [existing] = await db
            .select({ id: savedJobs.id })
            .from(savedJobs)
            .where(
                and(
                    eq(savedJobs.applicantId, currentUser.id),
                    eq(savedJobs.jobId, jobId),
                ),
            );

        if (!existing) {
            return { status: "ERROR", message: "Job not in saved list" };
        }

        await db
            .delete(savedJobs)
            .where(
                and(
                    eq(savedJobs.applicantId, currentUser.id),
                    eq(savedJobs.jobId, jobId),
                ),
            );

        return { status: "SUCCESS", message: "Job removed from saved list" };
    } catch (error) {
        return { status: "ERROR", message: "Failed to unsave job" };
    }
};

/**
 * Toggle save/unsave a job.
 */
export const toggleSaveJob = async (jobId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        const [existing] = await db
            .select({ id: savedJobs.id })
            .from(savedJobs)
            .where(
                and(
                    eq(savedJobs.applicantId, currentUser.id),
                    eq(savedJobs.jobId, jobId),
                ),
            );

        if (existing) {
            await db
                .delete(savedJobs)
                .where(
                    and(
                        eq(savedJobs.applicantId, currentUser.id),
                        eq(savedJobs.jobId, jobId),
                    ),
                );
            return { status: "SUCCESS", isSaved: false, message: "Job removed from saved list" };
        } else {
            await db.insert(savedJobs).values({
                applicantId: currentUser.id,
                jobId,
            });
            return { status: "SUCCESS", isSaved: true, message: "Job saved!" };
        }
    } catch (error) {
        return { status: "ERROR", message: "Failed to toggle saved job" };
    }
};

// ==================== MESSAGING ACTIONS ==================== //

/**
 * Send a message as the applicant in an existing conversation.
 * Mirrors: sendEmployerMessage()
 */
export const sendCandidateMessage = async (data: SendCandidateMessageData) => {
    try {
        const { data: validatedData, error } = sendCandidateMessageSchema.safeParse(data);
        if (error) return { status: "ERROR", message: error.issues[0].message };

        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized" };
        }

        // Verify applicant owns this conversation (through jobApplications.applicantId)
        const [conv] = await db
            .select({ id: conversations.id })
            .from(conversations)
            .innerJoin(jobApplications, eq(conversations.applicationId, jobApplications.id))
            .where(
                and(
                    eq(conversations.id, validatedData.conversationId),
                    eq(jobApplications.applicantId, currentUser.id),
                ),
            );

        if (!conv) {
            return { status: "ERROR", message: "Conversation not found" };
        }

        await db.transaction(async (tx) => {
            await tx.insert(messages).values({
                conversationId: validatedData.conversationId,
                senderRole: "applicant",
                senderId: currentUser.id,
                body: validatedData.body,
            });

            await tx.update(conversations)
                .set({ lastMessageAt: new Date(), applicantLastReadAt: new Date() })
                .where(eq(conversations.id, validatedData.conversationId));
        });

        return { status: "SUCCESS", message: "Message sent successfully" };
    } catch (error) {
        console.error("sendCandidateMessage error:", error);
        return { status: "ERROR", message: "Failed to send message" };
    }
};

// ==================== DATA FETCHING WRAPPERS (for client components) ==================== //

export const fetchApplicantDashboardAction = async () => {
    try {
        const data = await getApplicantDashboardStats();
        if (!data) return { status: "ERROR", message: "Unauthorized" };
        return { status: "SUCCESS", data };
    } catch {
        return { status: "ERROR", message: "Failed to fetch dashboard data" };
    }
};

export const fetchApplicantApplicationsAction = async () => {
    try {
        const applications = await getApplicantApplications();
        return { status: "SUCCESS", data: applications };
    } catch {
        return { status: "ERROR", message: "Failed to fetch applications", data: [] };
    }
};

export const fetchApplicantSavedJobsAction = async () => {
    try {
        const saved = await getApplicantSavedJobs();
        return { status: "SUCCESS", data: saved };
    } catch {
        return { status: "ERROR", message: "Failed to fetch saved jobs", data: [] };
    }
};

export const fetchApplicantProfileAction = async () => {
    try {
        const details = await getCurrentApplicantDetails();
        if (!details) return { status: "ERROR", message: "Unauthorized" };
        return { status: "SUCCESS", data: details };
    } catch {
        return { status: "ERROR", message: "Failed to fetch profile" };
    }
};

export const fetchApplicantSettingsAction = async () => {
    try {
        const data = await getApplicantSettingsData();
        if (!data) return { status: "ERROR", message: "Unauthorized" };
        return { status: "SUCCESS", data };
    } catch {
        return { status: "ERROR", message: "Failed to fetch settings" };
    }
};

export const fetchApplicantConversationsAction = async () => {
    try {
        const convs = await getApplicantConversations();
        return { status: "SUCCESS", data: convs };
    } catch {
        return { status: "ERROR", message: "Failed to fetch conversations", data: [] };
    }
};

export const fetchApplicantConversationMessagesAction = async (conversationId: number) => {
    try {
        const msgs = await getApplicantConversationMessages(conversationId);
        return { status: "SUCCESS", data: msgs };
    } catch {
        return { status: "ERROR", message: "Failed to fetch messages", data: [] };
    }
};

export const fetchRecommendedJobsAction = async (limit = 5) => {
    try {
        const recommended = await getRecommendedJobs(limit);
        return { status: "SUCCESS", data: recommended };
    } catch {
        return { status: "ERROR", message: "Failed to fetch recommended jobs", data: [] };
    }
};

export const checkJobStatus = async (jobId: number) => {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "applicant") {
            return { status: "ERROR", message: "Unauthorized", data: null };
        }

        const [applicant] = await db
            .select()
            .from(applicants)
            .where(eq(applicants.id, currentUser.id));

        if (!applicant) {
            return { status: "ERROR", message: "Applicant profile not found", data: null };
        }

        const [saved] = await db
            .select()
            .from(savedJobs)
            .where(
                and(
                    eq(savedJobs.applicantId, applicant.id),
                    eq(savedJobs.jobId, jobId)
                )
            );

        const [applied] = await db
            .select()
            .from(jobApplications)
            .where(
                and(
                    eq(jobApplications.applicantId, applicant.id),
                    eq(jobApplications.jobId, jobId)
                )
            );

        return { 
            status: "SUCCESS", 
            message: "Status checked", 
            data: { 
                isSaved: !!saved, 
                isApplied: !!applied 
            } 
        };
    } catch (error) {
        console.error("Failed to check job status", error);
        return { status: "ERROR", message: "Failed to check status", data: null };
    }
}

