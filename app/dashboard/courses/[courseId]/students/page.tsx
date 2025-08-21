import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseStudents } from "@/components/dashboard/course-students"

interface CourseStudentsPageProps {
  params: {
    courseId: string
  }
}

export default function CourseStudentsPage({ params }: CourseStudentsPageProps) {
  return (
    <DashboardLayout activeTab="courses">
      <CourseStudents courseId={params.courseId} />
    </DashboardLayout>
  )
}
