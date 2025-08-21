import * as pdfjsLib from "pdfjs-dist";

// The worker is needed for pdfjs-dist to work in the browser.
// Make sure the version matches the one in your package.json.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

export interface PDFProcessingResult {
  text: string;
  summary: string;
}

class PDFServiceClass {
  private async extractText(pdfUrl: string): Promise<string> {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  }

  private async summarizeText(text: string): Promise<string> {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to summarize text.");
    }

    const { summary } = await response.json();
    return summary;
  }

  public async processPDF(pdfUrl: string): Promise<PDFProcessingResult> {
    const text = await this.extractText(pdfUrl);
    const summary = await this.summarizeText(text);
    return { text, summary };
  }
}

export const PDFService = new PDFServiceClass();