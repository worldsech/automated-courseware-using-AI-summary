"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "@/components/auth-provider"
import { createCourse } from "@/lib/course-service"
import type { ClassLevel, Lecturer } from "@/lib/types"
import { Loader2, BookOpen } from "lucide-react"

export const CreateCourseForm = () => {
  const [title, setTitle] = useState("")
  const [requiredClass, setRequiredClass] = useState<ClassLevel | "">("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { user } = useAuthContext()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.role !== "lecturer") return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const lecturer = user as Lecturer
      await createCourse({
        title,
        lecturerId: lecturer.id,
        lecturerName: lecturer.fullName,
        requiredClass: requiredClass as ClassLevel,
      })

      setSuccess("Course created successfully!")
      setTitle("")
      setRequiredClass("")

      // Redirect to courses page after a short delay
      setTimeout(() => {
        router.push("/dashboard/courses")
      }, 1500)
    } catch (error: any) {
      setError(error.message || "Failed to create course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Create New Course
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="Enter course title (e.g., Introduction to Computer Science)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Required Class Level</Label>
            <Select onValueChange={(value) => setRequiredClass(value as ClassLevel)}>
              <SelectTrigger>
                <SelectValue placeholder="Select the class level for this course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ND1">ND1 (National Diploma Year 1)</SelectItem>
                <SelectItem value="ND2">ND2 (National Diploma Year 2)</SelectItem>
                <SelectItem value="HND1">HND1 (Higher National Diploma Year 1)</SelectItem>
                <SelectItem value="HND2">HND2 (Higher National Diploma Year 2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || !title || !requiredClass}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/courses")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
