"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "@/components/auth-provider"
import { getPendingEnrollments, approveEnrollment } from "@/lib/course-service"
import type { Enrollment, Lecturer } from "@/lib/types"
import { Users, Check, Loader2, UserCheck } from "lucide-react"

export const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState<(Enrollment & { studentName: string; courseName: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user } = useAuthContext()

  useEffect(() => {
    loadEnrollments()
  }, [user])

  const loadEnrollments = async () => {
    if (!user || user.role !== "lecturer") return

    try {
      const lecturer = user as Lecturer
      const enrollmentsData = await getPendingEnrollments(lecturer.id)
      setEnrollments(enrollmentsData)
    } catch (error: any) {
      setError(error.message || "Failed to load enrollments")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (enrollmentId: string) => {
    setApprovingId(enrollmentId)
    setError("")
    setSuccess("")

    try {
      await approveEnrollment(enrollmentId)
      setSuccess("Enrollment approved successfully!")

      // Remove the approved enrollment from the list
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message || "Failed to approve enrollment")
    } finally {
      setApprovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Enrollment Requests</h2>
        <p className="text-muted-foreground">Review and approve student enrollment requests for your courses.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No pending enrollments</h3>
            <p className="text-muted-foreground">All enrollment requests have been processed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">{enrollment.studentName}</h3>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Wants to enroll in: <span className="font-medium">{enrollment.courseName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested on: {enrollment.enrolledAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleApprove(enrollment.id)}
                    disabled={approvingId === enrollment.id}
                    className="gap-2"
                  >
                    {approvingId === enrollment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
