"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/auth-provider"
import { signOut } from "@/lib/auth"
import { BookOpen, PlusCircle, Users, BarChart3, LogOut, Menu, X, FileText, Settings, Lock } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab?: string
}

export const DashboardLayout = ({ children, activeTab }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuthContext()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const lecturerNavItems = [
    { id: "overview", label: "Overview", icon: BarChart3, href: "/dashboard" },
    { id: "courses", label: "My Courses", icon: BookOpen, href: "/dashboard/courses" },
    { id: "create-course", label: "Create Course", icon: PlusCircle, href: "/dashboard/create-course" },
    { id: "enrollments", label: "Enrollments", icon: Users, href: "/dashboard/enrollments" },
    { id: "scores", label: "Student Scores", icon: BarChart3, href: "/dashboard/scores" },
    { id: "change-password", label: "Change Password", icon: Lock, href: "/dashboard/change-password" }, // Added change password option for lecturers
  ]

  const studentNavItems = [
    { id: "overview", label: "Overview", icon: BarChart3, href: "/dashboard" },
    { id: "courses", label: "Available Courses", icon: BookOpen, href: "/dashboard/courses" },
    { id: "my-courses", label: "My Courses", icon: FileText, href: "/dashboard/my-courses" },
    { id: "change-password", label: "Change Password", icon: Lock, href: "/dashboard/change-password" }, // Added change password option for students
  ]

  const adminNavItems = [
    { id: "overview", label: "Overview", icon: BarChart3, href: "/dashboard" },
    { id: "users", label: "User Management", icon: Users, href: "/dashboard/users" },
    { id: "courses", label: "Course Management", icon: BookOpen, href: "/dashboard/courses" },
    { id: "settings", label: "System Settings", icon: Settings, href: "/dashboard/settings" },
    { id: "change-password", label: "Change Password", icon: Lock, href: "/dashboard/change-password" }, // Added change password option for admins
  ]

  const getNavItems = () => {
    if (user?.role === "admin") return adminNavItems
    if (user?.role === "lecturer") return lecturerNavItems
    return studentNavItems
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
            <SidebarContent
              navItems={navItems}
              activeTab={activeTab}
              user={user}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:block">
        <div className="h-full bg-card border-r border-border">
          <SidebarContent navItems={navItems} activeTab={activeTab} user={user} onSignOut={handleSignOut} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">
                {user?.role === "admin"
                  ? "Admin Dashboard"
                  : user?.role === "lecturer"
                    ? "Lecturer Dashboard"
                    : "Student Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {user?.fullName || user?.email || "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  navItems: Array<{
    id: string
    label: string
    icon: any
    href: string
  }>
  activeTab?: string
  user: any
  onSignOut: () => void
  onClose?: () => void
}

const SidebarContent = ({ navItems, activeTab, user, onSignOut, onClose }: SidebarContentProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b border-border">
        <BookOpen className="h-8 w-8 text-primary" />
        <span className="text-lg font-bold text-foreground">EduCourse</span>
        {onClose && (
          <Button variant="ghost" size="sm" className="ml-auto lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Link key={item.id} href={item.href} onClick={onClose}>
                <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User info and sign out */}
      <div className="p-4 border-t border-border">
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground">{user?.fullName || user?.email || "User"}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role || "user"}</p>
        </div>
        <Button variant="outline" className="w-full justify-start gap-3 bg-transparent" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
