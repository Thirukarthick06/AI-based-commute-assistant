import { Navbar } from "@/components/sections/navbar"
import { Hero } from "@/components/sections/hero"
import { About } from "@/components/sections/about"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Features } from "@/components/sections/features"
import { Demo } from "@/components/sections/demo"
import { TechStack } from "@/components/sections/tech-stack"
import { Team } from "@/components/sections/team"
import { SiteFooter } from "@/components/sections/footer"

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <Demo />
      <TechStack />
      <Team />
      <SiteFooter />
    </main>
  )
}
