"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthContext } from "@/components/auth-provider";
import {
  getAvailableCourses,
  enrollInCourse,
  checkEnrollmentStatus,
} from "@/lib/student-service";
import type { Course, Student, Enrollment } from "@/lib/types";
import { BookOpen, Users, Loader2, CheckCircle, Clock } from "lucide-react";

export const CourseDiscovery = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<
    Record<string, Enrollment | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuthContext();

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user || user.role !== "student") return;

    try {
      const student = user as Student;
      const coursesData = await getAvailableCourses(student.class);
      setCourses(coursesData);

      // Check enrollment status for each course
      const statuses: Record<string, Enrollment | null> = {};
      for (const course of coursesData) {
        const status = await checkEnrollmentStatus(student.id, course.id);
        statuses[course.id] = status;
      }
      setEnrollmentStatuses(statuses);
    } catch (error: any) {
      setError(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user || user.role !== "student") return;

    setEnrollingCourse(courseId);
    setError("");
    setSuccess("");

    try {
      const student = user as Student;
      const enrollment = await enrollInCourse(student.id, courseId);

      // Update enrollment status
      setEnrollmentStatuses((prev) => ({
        ...prev,
        [courseId]: enrollment,
      }));

      setSuccess(
        "Enrollment request submitted! Waiting for lecturer approval."
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to enroll in course");
    } finally {
      setEnrollingCourse(null);
    }
  };

  const getEnrollmentButton = (course: Course) => {
    const enrollment = enrollmentStatuses[course.id];

    if (!enrollment) {
      return (
        <Button
          onClick={() => handleEnroll(course.id)}
          disabled={enrollingCourse === course.id}
          className="w-full"
        >
          {enrollingCourse === course.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BookOpen className="mr-2 h-4 w-4" />
          )}
          Enroll
        </Button>
      );
    }

    if (enrollment.approved) {
      return (
        <Button
          disabled
          className="w-full bg-green-100 text-green-800 hover:bg-green-100"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Enrolled
        </Button>
      );
    }

    return (
      <Button
        disabled
        className="w-full bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      >
        <Clock className="mr-2 h-4 w-4" />
        Pending Approval
      </Button>
    );
  };

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
        <h2 className="text-2xl font-bold text-foreground">
          Available Courses
        </h2>
        <p className="text-muted-foreground">
          Courses available for your class level:{" "}
          <Badge variant="secondary">{(user as Student)?.class}</Badge>
        </p>
      </div>

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

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses available
            </h3>
            <p className="text-muted-foreground">
              No courses are currently available for your class level.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">{course.title}</span>
                  <Badge variant="outline">{course.requiredClass}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Lecturer: {course.lecturerName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {course.createdAt.toLocaleDateString()}
                  </div>
                  {course.files && course.files.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Course materials available</span>
                    </div>
                  )}
                </div>

                {getEnrollmentButton(course)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
