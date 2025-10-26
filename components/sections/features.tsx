import { Card, CardContent } from "@/components/ui/card"
import { Activity, Scale, Gauge, LineChart, Bot } from "lucide-react"

const features = [
  {
    title: "Smart Route Optimization",
    icon: Bot,
    desc: "AI orchestrates multi-modal routes to balance sustainability and speed.",
  },
  {
    title: "Real-time Traffic & Weather",
    icon: Activity,
    desc: "Continuously adapts to changing road and climate conditions.",
  },
  {
    title: "Cost vs. Carbon Comparison",
    icon: Scale,
    desc: "See trade-offs clearly to make informed decisions.",
  },
  {
    title: "Personalized Insights",
    icon: Gauge,
    desc: "Learns your preferences to improve recommendations over time.",
  },
  {
    title: "Eco Score Tracker",
    icon: LineChart,
    desc: "Track your cumulative carbon savings and commuting impact.",
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold">Key Features</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Built to optimize for sustainability, time, and cost—without compromise.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardContent className="p-5">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-[var(--color-chart-2)]/15">
                <f.icon className="size-5 text-[var(--color-chart-2)]" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
