"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pause, Download, FileText, Volume2, Loader2 } from "lucide-react";
import { PDFService, type PDFProcessingResult } from "@/lib/pdf-service";

interface EnhancedPDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

export function EnhancedPDFViewer({
  pdfUrl,
  fileName,
}: EnhancedPDFViewerProps) {
  const [processing, setProcessing] = useState(false);
  const [pdfData, setPdfData] = useState<PDFProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] =
    useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  const processPDF = async () => {
    setProcessing(true);
    setError(null);
    try {
      const result = await PDFService.processPDF(pdfUrl);
      setPdfData(result);
    } catch (error: any) {
      console.error("Error processing PDF:", error);
      setError(error.message || "An unknown error occurred while processing the PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const toggleTextToSpeech = () => {
    if (!speechSynthesis || !pdfData) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(pdfData.text);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button asChild variant="outline">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </a>
            </Button>
            <Button onClick={processPDF} disabled={processing}>
              {processing ? "Processing..." : "Process PDF"}
            </Button>
            {pdfData && speechSynthesis && (
              <Button onClick={toggleTextToSpeech} variant="outline">
                {isPlaying ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Volume2 className="h-4 w-4 mr-2" />
                )}
                {isPlaying ? "Stop" : "Listen"}
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processing && !pdfData && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">
                Extracting text and generating summary...
              </p>
            </div>
          )}

          {pdfData && (
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="viewer">PDF Viewer</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="fulltext">Full Text</TabsTrigger>
              </TabsList>

              <TabsContent value="viewer" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={`${pdfUrl}#toolbar=1`}
                        width="100%"
                        height="600px"
                        className="border-0"
                        title={fileName}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {pdfData.summary}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fulltext" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Extracted Text</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto bg-muted/50">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {pdfData.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
