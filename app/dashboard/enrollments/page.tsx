import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EnrollmentManagement } from "@/components/dashboard/enrollment-management"

export default function EnrollmentsPage() {
  return (
    <DashboardLayout activeTab="enrollments">
      <EnrollmentManagement />
    </DashboardLayout>
  )
}
