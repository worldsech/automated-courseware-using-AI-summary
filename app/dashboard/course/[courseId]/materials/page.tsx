"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CourseMaterials } from "@/components/dashboard/course-materials"

export default function CourseMaterialsPage() {
  const params = useParams()
  const courseId = params.courseId as string

  return (
    <DashboardLayout>
      <CourseMaterials courseId={courseId} />
    </DashboardLayout>
  )
}
