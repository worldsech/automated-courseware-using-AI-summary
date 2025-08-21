"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, BookOpen } from "lucide-react"
import type { Quiz, QuizAttempt } from "@/lib/types"

interface EnhancedQuizSystemProps {
  quiz: Quiz
  onComplete: (attempt: QuizAttempt) => void
}

export function EnhancedQuizSystem({ quiz, onComplete }: EnhancedQuizSystemProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60) // Convert to seconds
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime] = useState(new Date())

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !isSubmitted) {
      handleSubmit()
    }
  }, [timeRemaining, isSubmitted])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmit = () => {
    const endTime = new Date()
    const timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    // Calculate score
    let correctAnswers = 0
    quiz.questions.forEach((question) => {
      if (question.type === "multiple-choice" && answers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
      // For short answer questions, we'd need AI or manual grading
    })

    const score = Math.round((correctAnswers / quiz.questions.length) * 100)

    const attempt: QuizAttempt = {
      id: Date.now().toString(),
      quizId: quiz.id,
      studentId: "current-student", // Would come from auth context
      answers,
      score,
      timeTaken,
      submittedAt: endTime,
      isGraded: true,
    }

    setIsSubmitted(true)
    onComplete(attempt)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quiz Completed!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg mb-4">
            Thank you for completing the quiz. Your responses have been submitted.
          </p>
          <div className="text-center">
            <Button onClick={() => window.location.reload()}>Take Another Quiz</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {quiz.title}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{question.question}</p>

          {question.type === "multiple-choice" ? (
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <Textarea
              placeholder="Enter your answer here..."
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={4}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={!answers[question.id]}>
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quiz.questions.length}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
