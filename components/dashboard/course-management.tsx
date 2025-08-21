"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/components/auth-provider";
import {
  getCoursesByLecturer,
  uploadCourseFile,
  deleteCourseFile,
} from "@/lib/course-service";
import type { Course, Lecturer } from "@/lib/types";
import {
  BookOpen,
  FileText,
  Users,
  Plus,
  Loader2,
  Trash2,
  Download,
} from "lucide-react";
import Link from "next/link";

export const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuthContext();

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user || user.role !== "lecturer") return;

    try {
      const lecturer = user as Lecturer;
      const coursesData = await getCoursesByLecturer(lecturer.id);
      setCourses(coursesData);
    } catch (error: any) {
      setError(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    courseId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    if (!file.type.includes("pdf")) {
      setError("Please upload only PDF files");
      return;
    }

    setError("");

    try {
      await uploadCourseFile(courseId, file, onProgress);
      await loadCourses(); // Reload to get updated course data
    } catch (error: any) {
      console.error("File upload failed:", error);
      setError(error.message || "Failed to upload file");
    }
  };

  const handleFileDelete = async (courseId: string, fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await deleteCourseFile(courseId, fileId);
      await loadCourses(); // Reload to get updated course data
    } catch (error: any) {
      setError(error.message || "Failed to delete file");
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
        <Link href="/dashboard/create-course">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No courses yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first course to get started
            </p>
            <Link href="/dashboard/create-course">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onFileUpload={handleFileUpload}
              onFileDelete={handleFileDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CourseCardProps {
  course: Course;
  onFileUpload: (
    courseId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => void;
  onFileDelete: (courseId: string, fileId: string) => void;
}

const CourseCard = ({
  course,
  onFileUpload,
  onFileDelete,
}: CourseCardProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await onFileUpload(course.id, file, setUploadProgress);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-lg">{course.title}</span>
          <Badge variant="secondary">{course.requiredClass}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Course Materials</Label>
              <span className="text-xs text-muted-foreground">
                {course.files?.length || 0} file(s)
              </span>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
              {isUploading && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* File List */}
            {course.files && course.files.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {course.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFileDelete(course.id, file.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link href={`/dashboard/courses/${course.id}/quiz`}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <FileText className="mr-1 h-3 w-3" />
                Quizzes
              </Button>
            </Link>
            <Link href={`/dashboard/courses/${course.id}/students`}>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
              >
                <Users className="mr-1 h-3 w-3" />
                Students
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
