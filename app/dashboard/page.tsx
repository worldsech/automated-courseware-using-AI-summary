"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StudentOverview } from "@/components/dashboard/student-overview"
import { AdminOverview } from "@/components/dashboard/admin-overview"
import { useAuthContext } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (user.role === "admin") {
    return (
      <DashboardLayout activeTab="overview">
        <AdminOverview />
      </DashboardLayout>
    )
  }

  // Show student overview for students
  if (user.role === "student") {
    return (
      <DashboardLayout activeTab="overview">
        <StudentOverview />
      </DashboardLayout>
    )
  }

  // For lecturers, show lecturer overview (already implemented)
  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your courses.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
