"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from "@/components/auth-provider";
import { getLecturerStats } from "@/lib/course-service";
import type { Lecturer } from "@/lib/types";
import { BookOpen, Users, Clock, Loader2 } from "lucide-react";

export const LecturerOverview = () => {
  const [stats, setStats] = useState<{
    courseCount: number;
    studentCount: number;
    pendingEnrollmentCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user && user.role === "lecturer") {
      loadDashboardData(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async (lecturerId: string) => {
    setLoading(true);
    try {
      const lecturerStats = await getLecturerStats(lecturerId);
      setStats(lecturerStats);
    } catch (error) {
      console.error("Error loading lecturer dashboard data:", error);
      setStats(null);
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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Could not load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {(user as Lecturer)?.fullName}! Here's your teaching
          summary.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.courseCount === 1 ? "course" : "courses"} created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentCount}</div>
            <p className="text-xs text-muted-foreground">
              unique students enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Enrollments
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingEnrollmentCount}
            </div>
            <p className="text-xs text-muted-foreground">awaiting approval</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};