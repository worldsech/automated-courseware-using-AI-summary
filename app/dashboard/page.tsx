"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StudentOverview } from "@/components/dashboard/student-overview"
import { LecturerOverview } from "@/components/dashboard/lecturer-overview"
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

  const renderDashboardContent = () => {
    switch (user.role) {
      case "admin":
        return <AdminOverview />
      case "student":
        return <StudentOverview />
      case "lecturer":
        return <LecturerOverview />
      default:
        return <div>Welcome!</div>
    }
  }

  return (
    <DashboardLayout activeTab="overview">
      {renderDashboardContent()}
    </DashboardLayout>
  )
}
