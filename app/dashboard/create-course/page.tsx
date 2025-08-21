import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CreateCourseForm } from "@/components/dashboard/create-course-form"

export default function CreateCoursePage() {
  return (
    <DashboardLayout activeTab="create-course">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Course</h1>
          <p className="text-muted-foreground">Add a new course for your students to enroll in.</p>
        </div>
        <CreateCourseForm />
      </div>
    </DashboardLayout>
  )
}
