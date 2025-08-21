"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getAllStudents,
  getAllLecturers,
  deleteUser,
  createStudentByAdmin,
  createLecturerByAdmin,
} from "@/lib/admin-service"
import type { Student, Lecturer, ClassLevel } from "@/lib/types"
import { Users, GraduationCap, Plus, Trash2, Loader2, UserPlus } from "lucide-react"

export const UserManagement = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const [studentsData, lecturersData] = await Promise.all([getAllStudents(), getAllLecturers()])
      setStudents(studentsData)
      setLecturers(lecturersData)
    } catch (error: any) {
      setError(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userType: "student" | "lecturer") => {
    if (!confirm(`Are you sure you want to delete this ${userType}?`)) return

    try {
      await deleteUser(userId, userType)

      if (userType === "student") {
        setStudents(students.filter((s) => s.id !== userId))
      } else {
        setLecturers(lecturers.filter((l) => l.id !== userId))
      }

      setSuccess(`${userType} deleted successfully`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      setError(error.message || `Failed to delete ${userType}`)
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
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground">Manage students and lecturers on the platform.</p>
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

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="lecturers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lecturers ({lecturers.length})
          </TabsTrigger>
          <TabsTrigger value="add-users" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentsTable students={students} onDelete={(id) => handleDeleteUser(id, "student")} />
        </TabsContent>

        <TabsContent value="lecturers">
          <LecturersTable lecturers={lecturers} onDelete={(id) => handleDeleteUser(id, "lecturer")} />
        </TabsContent>

        <TabsContent value="add-users">
          <AddUsersForm onUserAdded={loadUsers} onError={setError} onSuccess={setSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StudentsTableProps {
  students: Student[]
  onDelete: (id: string) => void
}

const StudentsTable = ({ students, onDelete }: StudentsTableProps) => {
  return (
    <div className="space-y-4">
      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No students registered</h3>
            <p className="text-muted-foreground">No students have registered on the platform yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{student.fullName}</h3>
                      <Badge variant="secondary">{student.class}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                    <p className="text-sm text-muted-foreground">Matric: {student.matriculationNumber}</p>
                    <p className="text-xs text-muted-foreground">Joined: {student.createdAt.toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(student.id)}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
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

interface LecturersTableProps {
  lecturers: Lecturer[]
  onDelete: (id: string) => void
}

const LecturersTable = ({ lecturers, onDelete }: LecturersTableProps) => {
  return (
    <div className="space-y-4">
      {lecturers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No lecturers registered</h3>
            <p className="text-muted-foreground">No lecturers have registered on the platform yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lecturers.map((lecturer) => (
            <Card key={lecturer.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{lecturer.fullName}</h3>
                      <Badge variant="outline">Lecturer</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                    <p className="text-xs text-muted-foreground">Joined: {lecturer.createdAt.toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(lecturer.id)}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
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

interface AddUsersFormProps {
  onUserAdded: () => void
  onError: (error: string) => void
  onSuccess: (message: string) => void
}

const AddUsersForm = ({ onUserAdded, onError, onSuccess }: AddUsersFormProps) => {
  const [userType, setUserType] = useState<"student" | "lecturer">("student")
  const [loading, setLoading] = useState(false)

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

    try {
      await createStudentByAdmin(studentData)
      onSuccess("Student created successfully!")
      setStudentData({
        fullName: "",
        matriculationNumber: "",
        email: "",
        class: "" as ClassLevel,
        password: "",
      })
      onUserAdded()
    } catch (error: any) {
      onError(error.message || "Failed to create student")
    } finally {
      setLoading(false)
    }
  }

  const handleLecturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createLecturerByAdmin(lecturerData)
      onSuccess("Lecturer created successfully!")
      setLecturerData({
        fullName: "",
        email: "",
        password: "",
      })
      onUserAdded()
    } catch (error: any) {
      onError(error.message || "Failed to create lecturer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={userType} onValueChange={(value) => setUserType(value as "student" | "lecturer")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Add Student</TabsTrigger>
            <TabsTrigger value="lecturer">Add Lecturer</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Full Name</Label>
                <Input
                  id="student-name"
                  placeholder="Enter full name"
                  value={studentData.fullName}
                  onChange={(e) => setStudentData({ ...studentData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="matriculation">Matriculation Number</Label>
                <Input
                  id="matriculation"
                  placeholder="Enter matriculation number"
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
                  placeholder="Enter email"
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class Level</Label>
                <Select onValueChange={(value) => setStudentData({ ...studentData, class: value as ClassLevel })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class level" />
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
                  placeholder="Create password"
                  value={studentData.password}
                  onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Student
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="lecturer">
            <form onSubmit={handleLecturerSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lecturer-name">Full Name</Label>
                <Input
                  id="lecturer-name"
                  placeholder="Enter full name"
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
                  placeholder="Enter email"
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
                  placeholder="Create password"
                  value={lecturerData.password}
                  onChange={(e) => setLecturerData({ ...lecturerData, password: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Lecturer
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
