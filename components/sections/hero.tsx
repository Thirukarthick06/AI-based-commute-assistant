import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="hero" className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      {/* Accent backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="mx-auto h-[420px] max-w-6xl rounded-b-[var(--radius-xl)] bg-[var(--color-chart-2)]/15 blur-0" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:py-24">
        <h1 id="hero-title" className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          AI-Based Sustainable and Economical Daily Commute Assistant
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-muted-foreground">
          Smarter, Greener, and More Affordable Journeys — Powered by AI.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-[var(--color-chart-2)] text-[var(--color-primary-foreground)] hover:opacity-90">
            <Link href="#about">Learn More</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#demo">Try the Demo</Link>
          </Button>
        </div>

        <div className="mt-10 w-full">
          <img
            src="/dynamic-city-illustration-with-transport-network.jpg"
            alt="Dynamic city with connected transport network"
            className="mx-auto h-64 w-full max-w-4xl rounded-lg border border-border object-cover"
          />
        </div>
      </div>
    </section>
  )
}
