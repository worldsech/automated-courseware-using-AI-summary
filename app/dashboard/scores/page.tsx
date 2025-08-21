import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StudentScores } from "@/components/dashboard/student-scores"

export default function ScoresPage() {
  return (
    <DashboardLayout activeTab="scores">
      <StudentScores />
    </DashboardLayout>
  )
}
