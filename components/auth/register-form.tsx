"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { registerStudent, registerLecturer } from "@/lib/auth"
import type { ClassLevel } from "@/lib/types"
import { Loader2, BookOpen, GraduationCap, Users } from "lucide-react"

export const RegisterForm = () => {
  const [userType, setUserType] = useState<"student" | "lecturer">("student")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Student form state
  const [studentData, setStudentData] = useState({
    fullName: "",
    matriculationNumber: "",
    email: "",
    class: "" as ClassLevel,
    password: "",
  })

  // Lecturer form state
  const [lecturerData, setLecturerData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await registerStudent(studentData)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  const handleLecturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await registerLecturer(lecturerData)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Join EduCourse</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Choose your account type and fill in your details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "lecturer")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="lecturer" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Lecturer
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input
                      id="student-name"
                      placeholder="Enter your full name"
                      value={studentData.fullName}
                      onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matriculation">Matriculation Number</Label>
                    <Input
                      id="matriculation"
                      placeholder="Enter your matriculation number"
                      value={studentData.matriculationNumber}
                      onChange={(e) => setStudentData({ ...studentData, matriculationNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="Enter your email"
                      value={studentData.email}
                      onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class Level</Label>
                    <Select onValueChange={(value) => setStudentData({ ...studentData, class: value as ClassLevel })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your class level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ND1">ND1</SelectItem>
                        <SelectItem value="ND2">ND2</SelectItem>
                        <SelectItem value="HND1">HND1</SelectItem>
                        <SelectItem value="HND2">HND2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="Create a password"
                      value={studentData.password}
                      onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Student
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="lecturer">
                <form onSubmit={handleLecturerSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="lecturer-name">Full Name</Label>
                    <Input
                      id="lecturer-name"
                      placeholder="Enter your full name"
                      value={lecturerData.fullName}
                      onChange={(e) => setLecturerData({ ...lecturerData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lecturer-email">Email</Label>
                    <Input
                      id="lecturer-email"
                      type="email"
                      placeholder="Enter your email"
                      value={lecturerData.email}
                      onChange={(e) => setLecturerData({ ...lecturerData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lecturer-password">Password</Label>
                    <Input
                      id="lecturer-password"
                      type="password"
                      placeholder="Create a password"
                      value={lecturerData.password}
                      onChange={(e) => setLecturerData({ ...lecturerData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Lecturer
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Button variant="link" className="p-0 h-auto text-accent" onClick={() => router.push("/login")}>
                  Sign in here
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
