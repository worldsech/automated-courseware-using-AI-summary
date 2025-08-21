import { auth } from "./firebase";
import { geminiService } from "./gemini-service";

export interface PDFProcessingResult {
  text: string;
  summary: string;
  audioUrl?: string;
}

export class PDFService {
  static async uploadPDF(file: File, courseId: string): Promise<string> {
    if (!auth.currentUser) {
      throw new Error("User must be authenticated to upload files.");
    }
    const token = await auth.currentUser.getIdToken();
    const fileName = `${Date.now()}_${file.name}`;

    const response = await fetch(
      `/api/upload-blob?filename=${fileName}&courseId=${courseId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: file,
      }
    );

    const newBlob = await response.json();

    return newBlob.url;
  }

  static async extractTextFromPDF(pdfUrl: string): Promise<string> {
    try {
      // In a real implementation, you would use a PDF parsing library like pdf-parse
      // For demo purposes, we'll simulate text extraction
      const response = await fetch(pdfUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Simulated text extraction - in production use pdf-parse or similar
      return "This is extracted text from the PDF document. In a real implementation, this would contain the actual PDF content extracted using a PDF parsing library like pdf-parse or PDF.js.";
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Failed to extract text from PDF");
    }
  }

  static async generateSummary(text: string): Promise<string> {
    try {
      if (geminiService.isConfigured()) {
        return await geminiService.generateSummary(text);
      }

      // Fallback to simple summarization if Gemini is not configured
      const sentences = text.split(".").filter((s) => s.trim().length > 0);
      const summary = sentences.slice(0, 3).join(". ") + ".";

      return summary || "Summary of the document content would appear here.";
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error("Failed to generate summary");
    }
  }

  static async generateTextToSpeech(text: string): Promise<string> {
    try {
      // In a real implementation, you would use a TTS service like Google Cloud TTS
      // For demo purposes, we'll use the Web Speech API
      if ("speechSynthesis" in window) {
        return "browser-tts"; // Indicator to use browser TTS
      }

      throw new Error("Text-to-speech not supported");
    } catch (error) {
      console.error("Error generating text-to-speech:", error);
      throw new Error("Failed to generate audio");
    }
  }

  static async processPDF(pdfUrl: string): Promise<PDFProcessingResult> {
    const text = await this.extractTextFromPDF(pdfUrl);
    const summary = await this.generateSummary(text);
    const audioUrl = await this.generateTextToSpeech(text);

    return {
      text,
      summary,
      audioUrl: audioUrl === "browser-tts" ? undefined : audioUrl,
    };
  }
}
