"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuthContext } from "@/components/auth-provider"
import { getQuizzesForCourse, submitQuizResult } from "@/lib/student-service"
import type { Quiz, Student } from "@/lib/types"
import { Brain, CheckCircle, Loader2, ArrowRight, ArrowLeft } from "lucide-react"

interface QuizTakingProps {
  courseId: string
  courseName: string
}

export const QuizTaking = ({ courseId, courseName }: QuizTakingProps) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null)
  const [error, setError] = useState("")
  const { user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    loadQuizzes()
  }, [courseId])

  const loadQuizzes = async () => {
    try {
      const quizzesData = await getQuizzesForCourse(courseId)
      setQuizzes(quizzesData)
    } catch (error: any) {
      setError(error.message || "Failed to load quizzes")
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setCompleted(false)
    setScore(null)
    setError("")
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitQuiz = async () => {
    if (!selectedQuiz || !user || user.role !== "student") return

    setSubmitting(true)
    setError("")

    try {
      const student = user as Student

      // Calculate score
      let correctAnswers = 0
      selectedQuiz.questions.forEach((question) => {
        const userAnswer = answers[question.id]
        if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          correctAnswers++
        }
      })

      // Submit result
      await submitQuizResult({
        studentId: student.id,
        quizId: selectedQuiz.id,
        courseId,
        score: correctAnswers,
        totalQuestions: selectedQuiz.questions.length,
        answers,
      })

      setScore({ correct: correctAnswers, total: selectedQuiz.questions.length })
      setCompleted(true)
    } catch (error: any) {
      setError(error.message || "Failed to submit quiz")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (completed && score) {
    const percentage = Math.round((score.correct / score.total) * 100)
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardContent className="py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground mb-6">You have successfully submitted your answers.</p>

            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">
                {score.correct}/{score.total}
              </div>
              <div className="text-xl text-muted-foreground">{percentage}% Score</div>

              <div className="max-w-md mx-auto">
                <Progress value={percentage} className="h-3" />
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <Button onClick={() => router.push("/dashboard/my-courses")}>View My Courses</Button>
                <Button variant="outline" onClick={() => setSelectedQuiz(null)} className="bg-transparent">
                  Take Another Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{selectedQuiz.title}</h2>
            <p className="text-muted-foreground">Course: {courseName}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedQuiz(null)} className="bg-transparent">
            Exit Quiz
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
              </CardTitle>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

              {currentQuestion.type === "mcq" ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                >
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  placeholder="Enter your answer"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                <Button onClick={submitQuiz} disabled={submitting || !answers[currentQuestion.id]}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Quiz
                </Button>
              ) : (
                <Button onClick={nextQuestion} disabled={!answers[currentQuestion.id]}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Available Quizzes</h2>
        <p className="text-muted-foreground">Course: {courseName}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes available</h3>
            <p className="text-muted-foreground">Your lecturer hasn't created any quizzes for this course yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {quiz.questions.length} {quiz.questions.length === 1 ? "question" : "questions"}
                  </p>
                  <p className="text-xs text-muted-foreground">Created: {quiz.createdAt.toLocaleDateString()}</p>
                  <Button onClick={() => startQuiz(quiz)} className="w-full">
                    Start Quiz
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
