"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "@/components/auth-provider"
import { getStudentScores } from "@/lib/course-service"
import type { QuizResult, Lecturer } from "@/lib/types"
import { BarChart3, Loader2, Trophy, User } from "lucide-react"

export const StudentScores = () => {
  const [scores, setScores] = useState<(QuizResult & { studentName: string; quizTitle: string; courseName: string })[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useAuthContext()

  useEffect(() => {
    loadScores()
  }, [user])

  const loadScores = async () => {
    if (!user || user.role !== "lecturer") return

    try {
      const lecturer = user as Lecturer
      const scoresData = await getStudentScores(lecturer.id)
      setScores(scoresData)
    } catch (error: any) {
      setError(error.message || "Failed to load student scores")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
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
        <h2 className="text-2xl font-bold text-foreground">Student Scores</h2>
        <p className="text-muted-foreground">View quiz results and performance across all your courses.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {scores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No quiz results yet</h3>
            <p className="text-muted-foreground">Students haven't taken any quizzes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scores.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {scores.length > 0
                    ? Math.round(
                        scores.reduce((acc, score) => acc + (score.score / score.totalQuestions) * 100, 0) /
                          scores.length,
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(scores.map((score) => score.studentId)).size}</div>
              </CardContent>
            </Card>
          </div>

          {/* Scores List */}
          <div className="space-y-3">
            {scores.map((score) => (
              <Card key={score.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{score.studentName}</h3>
                        <Badge variant="outline">{score.courseName}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Quiz: {score.quizTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed: {score.completedAt.toLocaleDateString()} at {score.completedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(score.score, score.totalQuestions)}`}>
                        {score.score}/{score.totalQuestions}
                      </div>
                      <Badge variant={getScoreBadgeVariant(score.score, score.totalQuestions)}>
                        {Math.round((score.score / score.totalQuestions) * 100)}%
                      </Badge>
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
