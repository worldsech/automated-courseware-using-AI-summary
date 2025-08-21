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
import { Textarea } from "@/components/ui/textarea"
import { createQuiz } from "@/lib/course-service"
import type { QuizQuestion } from "@/lib/types"
import { Plus, Trash2, Loader2, FileQuestion } from "lucide-react"

interface QuizCreationProps {
  courseId: string
  courseName: string
}

export const QuizCreation = ({ courseId, courseName }: QuizCreationProps) => {
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState<Omit<QuizQuestion, "id">[]>([
    {
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        type: "mcq",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuestions(updatedQuestions)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      const oldOptionValue = question.options[optionIndex];
      question.options[optionIndex] = value;

      // If the answer being edited was the correct one, clear it to prevent stale data.
      if (question.correctAnswer === oldOptionValue) {
        question.correctAnswer = '';
      }
      setQuestions(updatedQuestions);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("")
    setSuccess("")

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is required`)
        setLoading(false)
        return
      }
      if (!q.correctAnswer.trim()) {
        setError(`Correct answer for question ${i + 1} is required`)
        setLoading(false)
        return
      }
      if (q.type === "mcq" && q.options?.some((opt) => !opt.trim())) {
        setError(`All options for question ${i + 1} are required`)
        setLoading(false)
        return
      }
    }

    try {
      const questionsWithIds = questions.map((q, index) => ({
        ...q,
        id: `q${index + 1}`,
      }))

      await createQuiz({
        courseId,
        title,
        questions: questionsWithIds,
      })

      setSuccess("Quiz created successfully!")

      // Reset form
      setTitle("")
      setQuestions([
        {
          question: "",
          type: "mcq",
          options: ["", "", "", ""],
          correctAnswer: "",
        },
      ])

      // Redirect after success
      setTimeout(() => {
        router.push(`/dashboard/courses`)
      }, 1500)
    } catch (error: any) {
      setError(error.message || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Create Quiz</h2>
        <p className="text-muted-foreground">Course: {courseName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Quiz Details
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
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Button type="button" variant="outline" onClick={addQuestion} className="bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, questionIndex) => (
                <Card key={questionIndex} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        placeholder="Enter your question"
                        value={question.question}
                        onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(questionIndex, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {question.type === "mcq" && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {question.options?.map((option, optionIndex) => (
                          <Input
                            key={optionIndex}
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            required
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      {question.type === "mcq" ? (
                        <Select
                          value={question.correctAnswer}
                          onValueChange={(value) => updateQuestion(questionIndex, "correctAnswer", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options
                              ?.filter((option) => option.trim())
                              .map((option, optionIndex) => (
                                <SelectItem key={optionIndex} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            {(!question.options || question.options.filter((option) => option.trim()).length === 0) && (
                              <div className="px-2 py-1 text-sm text-muted-foreground">
                                Please fill in the options above first
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Enter the correct answer"
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(questionIndex, "correctAnswer", e.target.value)}
                          required
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !title.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Quiz
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/courses")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
