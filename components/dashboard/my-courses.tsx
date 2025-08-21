"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/components/auth-provider";
import { getStudentEnrollments } from "@/lib/student-service";
import type { Enrollment, Course, Student } from "@/lib/types";
import {
  BookOpen,
  FileText,
  Brain,
  Download,
  Volume2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export const MyCourses = () => {
  const [enrollments, setEnrollments] = useState<
    (Enrollment & { course: Course })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthContext();

  useEffect(() => {
    loadEnrollments();
  }, [user]);

  const loadEnrollments = async () => {
    if (!user || user.role !== "student") return;

    try {
      const student = user as Student;
      const enrollmentsData = await getStudentEnrollments(student.id);
      setEnrollments(enrollmentsData);
    } catch (error: any) {
      setError(error.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const approvedEnrollments = enrollments.filter((e) => e.approved);
  const pendingEnrollments = enrollments.filter((e) => !e.approved);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
        <p className="text-muted-foreground">
          Access your enrolled courses and materials.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Approved Courses */}
      {approvedEnrollments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Active Courses
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {approvedEnrollments.map((enrollment) => (
              <CourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Courses */}
      {pendingEnrollments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Pending Approval
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-lg">{enrollment.course.title}</span>
                    <Badge variant="secondary">Pending</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Waiting for lecturer approval...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enrolled: {enrollment.enrolledAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Courses */}
      {enrollments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses yet
            </h3>
            <p className="text-muted-foreground mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <Link href="/dashboard/courses">
              <Button>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface CourseCardProps {
  enrollment: Enrollment & { course: Course };
}

const CourseCard = ({ enrollment }: CourseCardProps) => {
  const { course } = enrollment;

  const handleTextToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-lg">{course.title}</span>
          <Badge variant="default">Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Lecturer: {course.lecturerName}
          </p>
          <p className="text-xs text-muted-foreground">
            Enrolled: {enrollment.enrolledAt.toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-3">
          {course.files && course.files.length > 0 ? (
            <div className="text-sm text-green-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Materials available</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>No materials uploaded</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/dashboard/course/${course.id}/materials`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
              >
                <FileText className="mr-1 h-3 w-3" />
                Materials
              </Button>
            </Link>
            <Link
              href={`/dashboard/course/${course.id}/quiz`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
              >
                <Brain className="mr-1 h-3 w-3" />
                Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
