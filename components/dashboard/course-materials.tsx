"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/components/auth-provider";
import { getStudentEnrollments } from "@/lib/student-service";
import type { Course, Student } from "@/lib/types";
import { FileText, Loader2, BookOpen } from "lucide-react";
import { EnhancedPDFViewer } from "@/components/dashboard/enhanced-pdf-viewer";

interface CourseMaterialsProps {
  courseId: string;
}

export const CourseMaterials = ({ courseId }: CourseMaterialsProps) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const { user, isFirebaseConfigured } = useAuthContext();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setError(
        "Firebase is not configured. Please set up Firebase to access course materials."
      );
      setLoading(false);
      return;
    }
    loadCourse();
  }, [courseId, user, isFirebaseConfigured]);

  const loadCourse = async () => {
    if (!user || user.role !== "student") return;

    try {
      const student = user as Student;
      const enrollments = await getStudentEnrollments(student.id);
      const enrollment = enrollments.find(
        (e) => e.courseId === courseId && e.approved
      );

      if (enrollment) {
        setCourse(enrollment.course);
      } else {
        setError(
          "You don't have access to this course or it's not approved yet."
        );
      }
    } catch (error: any) {
      setError(error.message || "Failed to load course materials");
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = () => {
    if (!course) return;

    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if ("speechSynthesis" in window) {
      const text = `Course materials for ${course.title} by ${course.lecturerName}. This course is designed for ${course.requiredClass} students. Please download the PDF notes to access the complete course materials.`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      speechSynthesis.speak(utterance);
    } else {
      setError("Text-to-speech is not supported in your browser");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Course not found
          </h3>
          <p className="text-muted-foreground">
            The requested course could not be found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{course.title}</h2>
        <p className="text-muted-foreground">Lecturer: {course.lecturerName}</p>
      </div>

      {course.files && course.files.length > 0 ? (
        course.files
          .filter((file) => file.type.includes("pdf"))
          .map((file) => (
            <EnhancedPDFViewer
              key={file.id}
              pdfUrl={file.url}
              fileName={file.name}
            />
          ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No materials uploaded
            </h3>
            <p className="text-muted-foreground">
              Your lecturer hasn't uploaded course materials yet. Check back
              later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
