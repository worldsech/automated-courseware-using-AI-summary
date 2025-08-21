"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pause, Download, FileText, Volume2 } from "lucide-react";
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
    try {
      const result = await PDFService.processPDF(pdfUrl);
      setPdfData(result);
    } catch (error) {
      console.error("Error processing PDF:", error);
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

          {pdfData && (
            <Tabs defaultValue="viewer" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="fulltext">Full Text</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Generated Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-muted-foreground leading-relaxed">
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
                    <div className="border rounded-lg overflow-hidden mb-4">
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
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
