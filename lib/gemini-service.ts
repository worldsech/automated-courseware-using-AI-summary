import { GoogleGenerativeAI } from "@google/generative-ai"

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
  }

  isConfigured(): boolean {
    return !!this.genAI
  }

  async generateSummary(text: string): Promise<string> {
    if (!this.genAI) {
      throw new Error("Gemini API key not configured")
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" })

      const prompt = `Please provide a comprehensive summary of the following educational content. Focus on key concepts, main points, and important details that students should understand:\n\n${text}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error generating summary with Gemini:", error)
      throw new Error("Failed to generate summary using Gemini API")
    }
  }

  async generateQuizQuestions(
    text: string,
    questionCount = 5,
  ): Promise<
    Array<{
      question: string
      options?: string[]
      correctAnswer: string
      type: "mcq" | "short"
    }>
  > {
    if (!this.genAI) {
      throw new Error("Gemini API key not configured")
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" })

      const prompt = `Based on the following educational content, generate ${questionCount} quiz questions. Include both multiple choice questions (with 4 options each) and short answer questions. Format the response as JSON with the following structure:
      [
        {
          "question": "Question text",
          "options": ["A", "B", "C", "D"] (only for MCQ),
          "correctAnswer": "Correct answer",
          "type": "mcq" or "short"
        }
      ]
      
      Content: ${text}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const jsonText = response.text()

      // Parse the JSON response
      try {
        return JSON.parse(jsonText)
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return [
          {
            question: "What are the main concepts covered in this material?",
            correctAnswer: "Key concepts from the course material",
            type: "short" as const,
          },
        ]
      }
    } catch (error) {
      console.error("Error generating quiz questions with Gemini:", error)
      throw new Error("Failed to generate quiz questions using Gemini API")
    }
  }
}

export const geminiService = new GeminiService()
