import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Briefcase,
  Users,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  PlusCircle,
  ShieldAlertIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { getCurrentEmployerDetails, getEmployerCandidatesData } from "@/features/employer-features/employer.queries";
import { fetchEmployerAnalyticsAction } from "@/features/employer-features/employer.actions";
import { formatDistanceToNow } from "date-fns";

export default async function EmployerDashboard() {
  const data = await getCurrentEmployerDetails();
  const analyticsRes = await fetchEmployerAnalyticsAction();
  const candidatesData = await getEmployerCandidatesData();

  const analytics = analyticsRes.status === "SUCCESS" ? analyticsRes.data : null;
  const recentApplicants = candidatesData?.candidates?.slice(0, 5) || [];

  const stats = [
    {
      label: "Active Jobs",
      value: analytics?.summary?.activeJobs || 0,
      icon: Briefcase,
      change: "Current active postings",
    },
    {
      label: "Total Applicants",
      value: analytics?.summary?.totalApplications || 0,
      icon: Users,
      change: `${analytics?.summary?.newApplications || 0} new`,
    },
    { 
      label: "Average Match Score", 
      value: `${analytics?.summary?.avgMatchScore || 0}%`, 
      icon: TrendingUp, 
      change: "Across all applicants" 
    },
    {
      label: "Hired/Offered",
      value: analytics?.summary?.offeredCount || 0,
      icon: CheckCircle,
      change: "Candidates offered",
    },
  ];

  const activeJobs = analytics?.jobPerformance?.filter((job: any) => job.status === "published").slice(0, 5) || [];

  const getAvatarFallback = (name: string) => {
    if (!name) return "U"
    return name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        userType="employer"
        userName={data?.name || data?.employerDetails?.name || undefined}
        userEmail={data?.email || undefined}
      />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Employer, {data?.name}!
              </h1>
              <p className="text-muted-foreground my-1">
                Here&apos;s an overview of your recruitment activity
              </p>
              {!data?.isProfileCompleted && (
                <Item variant="destructive" className="mt-4 text-white w-3/4">
                  <ItemMedia variant="icon" className="bg-destructive">
                    <ShieldAlertIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className=" text-[.9rem]">
                      Incomplete Profile
                    </ItemTitle>
                    <ItemDescription className="text-white/80 text-[.8rem]">
                      You haven&apos;t completed your employer profile yet. Please
                      complete your profile to post jobs and access all
                      features.
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button size="sm" variant="destructive" asChild>
                      <Link href="/employer/company" className=" text-[.9rem]">
                        Complete Profile
                      </Link>
                    </Button>
                  </ItemActions>
                </Item>
              )}
            </div>
            <Button asChild>
              <Link href="/employer/post-job">
                <PlusCircle className="h-4 w-4 mr-2" />
                Post New Job
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                  <p className="text-xs text-accent mt-2">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Active Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Job Postings</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/employer/jobs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeJobs.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active job postings.</p>
                  )}
                  {activeJobs.map((job: any) => (
                    <div
                      key={job.jobId}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {job.title}
                          </p>
                          {job.newApps > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-accent/10 text-accent"
                            >
                              +{job.newApps} new
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <Clock className="h-3 w-3" />
                            {job.employmentType}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium">
                          {job.totalApps} applicants
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.avgMatchScore}% avg match
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applicants</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/employer/candidates">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplicants.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent applicants.</p>
                  )}
                  {recentApplicants.map((applicant: any) => (
                    <div
                      key={applicant.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getAvatarFallback(applicant.candidateName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {applicant.candidateName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {applicant.candidateTitle || "Candidate"} {applicant.experience ? `• ${applicant.experience}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied for: {applicant.jobTitle}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium text-accent">
                          {applicant.matchScore || 0}% match
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link href="/employer/post-job">
                    <PlusCircle className="h-6 w-6 text-primary" />
                    <span>Post New Job</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link href="/employer/candidates">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Browse Candidates</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link href="/employer/jobs">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span>Manage Jobs</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <Link href="/employer/analytics">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <span>View Analytics</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
