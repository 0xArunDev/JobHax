import { DashboardSidebar } from "@/components/dashboard-sidebar"
import CandidateForm from "@/components/candidate-form";
import { getCurrentApplicantDetails } from "@/features/candidate-features/candidate.queries";

export default async function CandidateProfilePage() {
  const candidate = await getCurrentApplicantDetails();

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        userType="candidate"
        userName={candidate?.name || undefined}
        userEmail={candidate?.email || undefined}
      />

      <CandidateForm candidate={candidate} />
    </div>
  );
}
