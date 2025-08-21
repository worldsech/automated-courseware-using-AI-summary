import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Award } from "lucide-react"

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-background to-card py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transform Your Learning
            <span className="text-primary block">Experience</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Access course materials, take quizzes, and connect with your lecturers in one seamless platform. Built for
            students and educators who value excellence in education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card p-8 rounded-lg shadow-sm border border-border text-center">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Course Materials</h3>
            <p className="text-muted-foreground">
              Access PDF notes, download materials, and enjoy text-to-speech functionality for better learning.
            </p>
          </div>
          <div className="bg-card p-8 rounded-lg shadow-sm border border-border text-center">
            <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Interactive Quizzes</h3>
            <p className="text-muted-foreground">
              Test your knowledge with MCQ and short-answer quizzes, get instant results and track progress.
            </p>
          </div>
          <div className="bg-card p-8 rounded-lg shadow-sm border border-border text-center">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-3">Lecturer Approval</h3>
            <p className="text-muted-foreground">
              Enroll in courses with lecturer approval system ensuring quality education and proper guidance.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
