"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/auth-provider"
import { getCourseStudents } from "@/lib/course-service"
import type { Enrollment } from "@/lib/types"
import { Users, Mail, Calendar, Loader2, UserCheck } from "lucide-react"
import Link from "next/link"

interface CourseStudentsProps {
  courseId: string
  courseName?: string
}

export const CourseStudents = ({ courseId, courseName }: CourseStudentsProps) => {
  const [students, setStudents] = useState<(Enrollment & { studentName: string; studentEmail: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuthContext()

  useEffect(() => {
    loadStudents()
  }, [courseId, user])

  const loadStudents = async () => {
    if (!user || user.role !== "lecturer") return

    try {
      console.log("[v0] Loading students for course:", courseId)
      const studentsData = await getCourseStudents(courseId)
      console.log("[v0] Loaded students:", studentsData.length)
      setStudents(studentsData)
    } catch (error: any) {
      console.error("[v0] Error loading students:", error)
      setError(error.message || "Failed to load enrolled students")
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Enrolled Students</h2>
          <p className="text-muted-foreground">
            {courseName ? `Students enrolled in ${courseName}` : "View and manage enrolled students"}
          </p>
        </div>
        <Link href="/dashboard/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No enrolled students</h3>
            <p className="text-muted-foreground">No students have been approved for this course yet.</p>
            <div className="mt-4">
              <Link href="/dashboard/enrollments">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Enrollments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Course Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{students.length}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{students.filter((s) => s.approved).length}</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <div className="space-y-3">
            {students.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{student.studentName}</h3>
                        <Badge variant="default">Enrolled</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{student.studentEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Enrolled: {student.enrolledAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/scores?student=${student.studentId}`}>
                        <Button variant="outline" size="sm">
                          View Scores
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
