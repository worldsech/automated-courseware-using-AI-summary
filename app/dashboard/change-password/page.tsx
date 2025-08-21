"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChangePasswordForm } from "@/components/dashboard/change-password-form"
import { useAuthContext } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function ChangePasswordPage() {
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

  return (
    <DashboardLayout activeTab="change-password">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Change Password</h1>
          <p className="text-muted-foreground">Update your account password for security.</p>
        </div>

        <ChangePasswordForm />
      </div>
    </DashboardLayout>
  )
}
