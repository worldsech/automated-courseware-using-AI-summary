export type UserRole = "student" | "lecturer" | "admin"

export type ClassLevel = "ND1" | "ND2" | "HND1" | "HND2"

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: Date
}

export interface Student extends User {
  fullName: string
  matriculationNumber: string
  class: ClassLevel
}

export interface Lecturer extends User {
  fullName: string
}

export interface CourseFile {
  id: string
  name: string
  url: string
  size: number
  uploadedAt: Date
  type: string
}

export interface Course {
  id: string
  title: string
  lecturerId: string
  lecturerName: string
  requiredClass: ClassLevel
  files: CourseFile[]
  createdAt: Date
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  approved: boolean
  enrolledAt: Date
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  questions: QuizQuestion[]
  createdAt: Date
}

export interface QuizQuestion {
  id: string
  question: string
  type: "mcq" | "short-answer"
  options?: string[] // For MCQ
  correctAnswer: string
}

export interface QuizResult {
  id: string
  studentId: string
  quizId: string
  courseId: string
  score: number
  totalQuestions: number
  answers: Record<string, string>
  completedAt: Date
}
