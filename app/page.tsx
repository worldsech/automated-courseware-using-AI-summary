import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { EnvironmentSetup } from "@/components/environment-setup"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        
        <HeroSection />
      </main>
    </div>
  )
}
