"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/components/auth-provider";
import {
  getStudentEnrollments,
  getStudentQuizResults,
} from "@/lib/student-service";
import type { Enrollment, Course, Student, QuizResult } from "@/lib/types";
import { BookOpen, CheckCircle, Clock, Trophy, Loader2 } from "lucide-react";

export const StudentOverview = () => {
  const [enrollments, setEnrollments] = useState<
    (Enrollment & { course: Course })[]
  >([]);
  const [quizResults, setQuizResults] = useState<
    (QuizResult & { quizTitle: string; courseName: string })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user || user.role !== "student") {
      setLoading(false);
      return;
    }

    try {
      const student = user as Student;
      console.log("Loading dashboard data for student:", student.id);

      const [enrollmentsData, resultsData] = await Promise.all([
        getStudentEnrollments(student.id),
        getStudentQuizResults(student.id),
      ]);

      console.log(" Loaded enrollments:", enrollmentsData.length);
      console.log("Loaded quiz results:", resultsData.length);

      setEnrollments(enrollmentsData);
      setQuizResults(resultsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set empty arrays to prevent UI crashes
      setEnrollments([]);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const approvedEnrollments = enrollments.filter((e) => e.approved);
  const pendingEnrollments = enrollments.filter((e) => !e.approved);
  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (acc, result) => acc + (result.score / result.totalQuestions) * 100,
            0
          ) / quizResults.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {(user as Student)?.fullName}! Here's your learning
          progress.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvedEnrollments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedEnrollments.length === 1 ? "course" : "courses"} enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingEnrollments.length}
            </div>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quizzes Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizResults.length}</div>
            <p className="text-xs text-muted-foreground">total attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">across all quizzes</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {approvedEnrollments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No active courses
              </p>
            ) : (
              <div className="space-y-3">
                {approvedEnrollments.slice(0, 3).map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{enrollment.course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.course.lecturerName}
                      </p>
                    </div>
                    <div className="text-right">
                      {enrollment.course.files &&
                      enrollment.course.files.length > 0 ? (
                        <span className="text-xs text-green-600">
                          Materials available
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No materials
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Results</CardTitle>
          </CardHeader>
          <CardContent>
            {quizResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No quiz results yet
              </p>
            ) : (
              <div className="space-y-3">
                {quizResults.slice(0, 3).map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{result.quizTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {result.courseName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {result.score}/{result.totalQuestions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(
                          (result.score / result.totalQuestions) * 100
                        )}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
