import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MyCourses } from "@/components/dashboard/my-courses"

export default function MyCoursesPage() {
  return (
    <DashboardLayout activeTab="my-courses">
      <MyCourses />
    </DashboardLayout>
  )
}
