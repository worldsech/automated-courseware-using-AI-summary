"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseDiscovery } from "@/components/dashboard/course-discovery"
import { CourseManagement } from "@/components/dashboard/course-management"
import { CourseAdmin } from "@/components/dashboard/course-admin"
import { useAuthContext } from "@/components/auth-provider"

export default function CoursesPage() {
  const { user } = useAuthContext()

  const renderContent = () => {
    if (user?.role === "admin") return <CourseAdmin />
    if (user?.role === "student") return <CourseDiscovery />
    return <CourseManagement />
  }

  return <DashboardLayout activeTab="courses">{renderContent()}</DashboardLayout>
}
