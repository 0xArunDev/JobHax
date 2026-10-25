import { db } from "@/src/config/db";
import { jobs, employers, users } from "@/src/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const getPublicJobs = async () => {
    const publishedJobs = await db
        .select({
            id: jobs.id,
            title: jobs.title,
            location: jobs.location,
            employmentType: jobs.employmentType,
            salaryMin: jobs.salaryMin,
            salaryMax: jobs.salaryMax,
            skills: jobs.skills,
            workplaceType: jobs.workplaceType,
            isFeatured: jobs.isFeatured,
            createdAt: jobs.createdAt,
            // Employer details
            employerName: employers.name,
        })
        .from(jobs)
        .innerJoin(employers, eq(jobs.employerId, employers.id))
        .where(eq(jobs.status, "published"))
        .orderBy(desc(jobs.createdAt));
        
    return publishedJobs;
};

export const getPublicJobById = async (jobId: number) => {
    const [job] = await db
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
            description: jobs.description,
            department: jobs.department,
            status: jobs.status,
            // Employer details
            employerId: employers.id,
            employerName: employers.name,
            employerLocation: employers.location,
            employerDescription: employers.description,
            employerWebsiteUrl: employers.websiteUrl,
            employerTeamSize: employers.teamSize,
            employerMetadata: employers.metadata,
        })
        .from(jobs)
        .innerJoin(employers, eq(jobs.employerId, employers.id))
        .where(eq(jobs.id, jobId));
        
    return job || null;
};
