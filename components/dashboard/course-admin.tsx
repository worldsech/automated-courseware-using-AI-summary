"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getAllCourses, deleteCourse } from "@/lib/admin-service";
import type { Course } from "@/lib/types";
import { BookOpen, Trash2, FileText, Users, Loader2 } from "lucide-react";

export const CourseAdmin = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesData = await getAllCourses();
      setCourses(coursesData);
    } catch (error: any) {
      setError(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`
      )
    )
      return;

    setDeletingId(courseId);
    setError("");

    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
      setSuccess("Course deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.message || "Failed to delete course");
    } finally {
      setDeletingId(null);
    }
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
          Course Management
        </h2>
        <p className="text-muted-foreground">
          View and manage all courses on the platform.
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
              No courses created
            </h3>
            <p className="text-muted-foreground">
              No courses have been created on the platform yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">{course.title}</span>
                  <Badge variant="secondary">{course.requiredClass}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Lecturer: {course.lecturerName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Created: {course.createdAt.toLocaleDateString()}
                  </div>
                  {course.files && course.files.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText className="h-4 w-4" />
                      <span>Materials uploaded</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>No materials</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCourse(course.id, course.title)}
                  disabled={deletingId === course.id}
                  className="w-full text-destructive hover:text-destructive bg-transparent"
                >
                  {deletingId === course.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
