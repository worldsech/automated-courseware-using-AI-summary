"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { QuizTaking } from "@/components/dashboard/quiz-taking"
import { getStudentEnrollments } from "@/lib/student-service"
import { useAuthContext } from "@/components/auth-provider"
import type { Course, Student } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function CourseQuizPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthContext()

  useEffect(() => {
    loadCourse()
  }, [courseId, user])

  const loadCourse = async () => {
    if (!user || user.role !== "student") return

    try {
      const student = user as Student
      const enrollments = await getStudentEnrollments(student.id)
      const enrollment = enrollments.find((e) => e.courseId === courseId && e.approved)

      if (enrollment) {
        setCourse(enrollment.course)
      }
    } catch (error) {
      console.error("Error loading course:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Course not found</h2>
          <p className="text-muted-foreground">You don't have access to this course or it's not approved yet.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <QuizTaking courseId={course.id} courseName={course.title} />
    </DashboardLayout>
  )
}
