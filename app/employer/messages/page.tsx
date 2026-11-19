import { getEmployerConversations } from "@/features/employer-features/employer.queries"
import { getCurrentUser } from "@/features/auth/server/auth.queries"
import { EmployerMessagesClient } from "./messages-client"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Messages | Employer Dashboard",
  description: "Manage candidate conversations",
}

export default async function EmployerMessagesPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.role !== "employer") {
    redirect("/login")
  }

  // Fetch on the server so the client starts with data
  const conversations = await getEmployerConversations()

  return (
    <EmployerMessagesClient 
      initialConversations={conversations} 
      currentUser={currentUser}
    />
  )
}
