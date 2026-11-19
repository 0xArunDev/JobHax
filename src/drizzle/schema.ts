import { relations } from 'drizzle-orm';
import { int, mysqlTable, text, varchar, timestamp, mysqlEnum, date, year, json, boolean, uniqueIndex, index } from 'drizzle-orm/mysql-core';

export type EmployerNotificationPreferences = {
    newApplications?: boolean;
    applicationUpdates?: boolean;
    weeklyReports?: boolean;
    productUpdates?: boolean;
};

export type ApplicantNotificationPreferences = {
    jobMatches?: boolean;
    applicationUpdates?: boolean;
    interviewReminders?: boolean;
    profileViews?: boolean;
    marketingEmails?: boolean;
};

export type ApplicantPrivacySettings = {
    profileVisible?: boolean;
    showContactInfo?: boolean;
    openToWork?: boolean;
};

export type ApplicantMetadata = {
    title?: string; // Professional title, e.g. "Senior Frontend Developer"
    skills?: string[];
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    resumeUrl?: string;
    experienceEntries?: {
        title: string;
        company: string;
        location?: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }[];
    educationEntries?: {
        degree: string;
        school: string;
        location?: string;
        startDate: string;
        endDate?: string;
    }[];
    notifications?: ApplicantNotificationPreferences;
    privacy?: ApplicantPrivacySettings;
};

export type EmployerMetadata = {
    tagline?: string;
    culture?: string;
    benefits?: string;
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
    };
    notifications?: EmployerNotificationPreferences;
};

export const users = mysqlTable('users', {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    userName: varchar("username", { length: 255 }).unique().notNull(),
    password: text("password").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: mysqlEnum("role", ["admin", "employer", "applicant"]).notNull(),
    phoneNumber: varchar("phone_number", { length: 255 }),
    avatarUrl: text("avatar_url"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});

export const sessions = mysqlTable('sessions', {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent").notNull(),
    ip: varchar("ip", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull()
});

export const employers = mysqlTable("employers", {
    id: int("id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 255 }),
    description: text("description"),
    industry: varchar("organization_type", { length: 100 }),
    teamSize: varchar("team_size", { length: 50 }),
    yearOfEstablishment: year("year_of_establishment"), // MySQL YEAR type
    websiteUrl: varchar("website_url", { length: 255 }),
    location: varchar("location", { length: 255 }),
    metadata: json("metadata").$type<EmployerMetadata>(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const applicants = mysqlTable("applicants", {
    id: int("id")
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),

    biography: text("biography"),
    dateOfBirth: date("date_of_birth"),
    nationality: varchar("nationality", { length: 100 }),
    maritalStatus: mysqlEnum("marital_status", ["single", "married", "divorced"]),
    gender: mysqlEnum("gender", ["male", "female", "other"]),
    education: mysqlEnum("education", [
        "none",
        "high school",
        "undergraduate",
        "masters",
        "phd",
    ]),
    experience: text("experience"),
    websiteUrl: varchar("website_url", { length: 255 }),
    location: varchar("location", { length: 255 }),
    metadata: json("metadata").$type<ApplicantMetadata>(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    employer: one(employers, {
        fields: [users.id],
        references: [employers.id],
    }),

    applicant: one(applicants, {
        fields: [users.id],
        references: [applicants.id],
    }),

    sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));


export const jobs = mysqlTable("jobs", {
    id: int("id").autoincrement().primaryKey(),
    employerId: int("employer_id").notNull().references(() => employers.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    department: mysqlEnum("department", [
        "engineering",
        "design",
        "marketing",
        "sales",
        "hr",
        "finance",
    ]),
    employmentType: mysqlEnum("employment_type", [
        "full-time",
        "part-time",
        "contract",
        "internship",
    ]).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    workplaceType: mysqlEnum("workplace_type", [
        "onsite",
        "remote",
        "hybrid",
    ]),
    salaryMin: int("salary_min"),
    salaryMax: int("salary_max"),
    experienceLevel: mysqlEnum("experience_level", [
        "entry",
        "mid",
        "senior",
        "lead",
        "executive",
    ]),
    description: text("description").notNull(),
    requirements: text("requirements"),
    benefits: text("benefits"),
    skills: json("skills").$type<string[]>(),
    isFeatured: boolean("is_featured").default(false),
    isUrgent: boolean("is_urgent").default(false),
    notifyCandidates: boolean("notify_candidates").default(true),
    status: mysqlEnum("status", ["draft", "published", "paused", "closed"]).default("published"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});


export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

export const jobApplications = mysqlTable("job_applications", {
    id: int("id").autoincrement().primaryKey(),
    jobId: int("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
    applicantId: int("applicant_id").references(() => users.id, { onDelete: "set null" }),
    candidateName: varchar("candidate_name", { length: 255 }).notNull(),
    candidateEmail: varchar("candidate_email", { length: 255 }).notNull(),
    candidatePhone: varchar("candidate_phone", { length: 50 }),
    candidateLocation: varchar("candidate_location", { length: 255 }),
    candidateTitle: varchar("candidate_title", { length: 255 }),
    experience: varchar("experience", { length: 100 }),
    education: varchar("education", { length: 100 }),
    skills: json("skills").$type<string[]>(),
    resumeUrl: text("resume_url"),
    coverLetter: text("cover_letter"),
    portfolioUrl: varchar("portfolio_url", { length: 255 }),
    linkedinUrl: varchar("linkedin_url", { length: 255 }),
    status: mysqlEnum("status", ["new", "screening", "interview", "offered", "rejected"]).default("new").notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    matchScore: int("match_score").default(85),
    interviewDate: timestamp("interview_date"),
    interviewType: varchar("interview_type", { length: 50 }),
    interviewNotes: text("interview_notes"),
    notes: text("notes"),
    appliedAt: timestamp("applied_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const jobsRelations = relations(jobs, ({ one, many }) => ({
    employer: one(employers, {
        fields: [jobs.employerId],
        references: [employers.id],
    }),
    applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
    job: one(jobs, {
        fields: [jobApplications.jobId],
        references: [jobs.id],
    }),
    applicant: one(users, {
        fields: [jobApplications.applicantId],
        references: [users.id],
    }),
}));

export type JobApplication = typeof jobApplications.$inferSelect;
export type NewJobApplication = typeof jobApplications.$inferInsert;
export type ApplicationStatus = "new" | "screening" | "interview" | "offered" | "rejected";

export const savedJobs = mysqlTable(
    "saved_jobs",
    {
        id: int("id").autoincrement().primaryKey(),
        applicantId: int("applicant_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        jobId: int("job_id")
            .notNull()
            .references(() => jobs.id, { onDelete: "cascade" }),
        savedAt: timestamp("saved_at").defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("saved_jobs_applicant_job_unique").on(
            table.applicantId,
            table.jobId,
        ),
    ],
);

export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
    applicant: one(users, {
        fields: [savedJobs.applicantId],
        references: [users.id],
    }),
    job: one(jobs, {
        fields: [savedJobs.jobId],
        references: [jobs.id],
    }),
}));

export type SavedJob = typeof savedJobs.$inferSelect;
export type NewSavedJob = typeof savedJobs.$inferInsert;

export const conversations = mysqlTable(
    "conversations",
    {
        id: int("id").autoincrement().primaryKey(),
        applicationId: int("application_id")
            .notNull()
            .references(() => jobApplications.id, { onDelete: "cascade" }),
        employerId: int("employer_id")
            .notNull()
            .references(() => employers.id, { onDelete: "cascade" }),
        lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
        employerLastReadAt: timestamp("employer_last_read_at"),
        applicantLastReadAt: timestamp("applicant_last_read_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    },
    (table) => [
        uniqueIndex("conversations_application_id_unique").on(table.applicationId),
        index("conversations_employer_id_idx").on(table.employerId),
    ],
);

export const messages = mysqlTable(
    "messages",
    {
        id: int("id").autoincrement().primaryKey(),
        conversationId: int("conversation_id")
            .notNull()
            .references(() => conversations.id, { onDelete: "cascade" }),
        senderRole: mysqlEnum("sender_role", ["employer", "applicant"]).notNull(),
        senderId: int("sender_id").references(() => users.id, { onDelete: "set null" }),
        body: text("body").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [index("messages_conversation_id_idx").on(table.conversationId)],
);

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
    application: one(jobApplications, {
        fields: [conversations.applicationId],
        references: [jobApplications.id],
    }),
    employer: one(employers, {
        fields: [conversations.employerId],
        references: [employers.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
}));

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageSenderRole = "employer" | "applicant";
export type Applicant = typeof applicants.$inferSelect;
export type NewApplicant = typeof applicants.$inferInsert;