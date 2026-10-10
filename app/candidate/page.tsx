import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ArrowRight,
  Building2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  getApplicantDashboardStats,
  getRecommendedJobs,
} from "@/features/candidate-features/candidate.queries";

const statusConfig = {
  new: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-600",
    icon: Clock,
  },
  screening: {
    label: "Under Review",
    color: "bg-blue-500/10 text-blue-600",
    icon: Eye,
  },
  interview: {
    label: "Interview Scheduled",
    color: "bg-green-500/10 text-green-600",
    icon: CheckCircle,
  },
  offered: {
    label: "Offer Received",
    color: "bg-accent/10 text-accent",
    icon: CheckCircle,
  },
  rejected: {
    label: "Not Selected",
    color: "bg-red-500/10 text-red-600",
    icon: XCircle,
  },
};

export default async function CandidateDashboard() {
  const dashboardStats = await getApplicantDashboardStats();
  const recommendedJobs = await getRecommendedJobs();

  if (!dashboardStats) {
    return null;
  }

  const { user, applications, counts } = dashboardStats;
  const isProfileCompleted = user.isProfileCompleted ?? false;

  const stats = [
    {
      label: "Total Applications",
      value: counts.totalApplications,
      icon: FileText,
      change: "All time",
    },
    {
      label: "Jobs Saved",
      value: counts.savedJobs,
      icon: Briefcase,
      change: "All time",
    },
    {
      label: "Interviews",
      value: counts.interview,
      icon: CheckCircle,
      change: "Scheduled",
    },
    {
      label: "Offers",
      value: counts.offered,
      icon: CheckCircle,
      change: "Received",
    },
  ];

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        userType="candidate"
        userName={user.name}
        userEmail={user.email}
      />

      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening with your job search
            </p>
          </div>

          {/* Profile Completion */}
          {!isProfileCompleted && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      Complete Your Profile
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      A complete profile increases your chances of getting hired
                      by 3x
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={25} className="flex-1 h-2" />
                      <span className="text-sm font-medium">Incomplete</span>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href="/candidate/profile">
                      Complete Profile
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-accent" />
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
            {/* Recent Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/candidate/applications">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((app) => {
                    const status =
                      statusConfig[app.status as keyof typeof statusConfig] ||
                      statusConfig.new;
                    return (
                      <div
                        key={app.id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold uppercase">
                          {app.employerName?.charAt(0) || "C"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {app.jobTitle}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{app.employerName}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge className={status.color}>{status.label}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {recentApplications.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No applications yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Jobs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recommended for You</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold uppercase">
                        {job.employerName?.charAt(0) || "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{job.employerName}</span>
                          <span className="text-muted-foreground">•</span>
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{job.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.salaryMin && job.salaryMax
                            ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}`
                            : "Salary unspecified"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          asChild
                        >
                          <Link href={`/jobs/${job.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {recommendedJobs.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No recommended jobs at the moment.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
