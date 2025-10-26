import { Card, CardContent } from "@/components/ui/card"
import { Bus, TrainFront, Bike, Users, Footprints, CloudSun, TrafficCone } from "lucide-react"

const steps = [
  {
    title: "Enter route",
    desc: "Provide source and destination.",
  },
  {
    title: "AI analyzes",
    desc: "Considers bus, metro, cycle, carpool, walk.",
  },
  {
    title: "Compare factors",
    desc: "Cost, time, carbon output, traffic, weather.",
  },
  {
    title: "Get result",
    desc: "Best sustainable and economical route.",
  },
]

const modes = [
  { label: "Bus", icon: Bus },
  { label: "Metro", icon: TrainFront },
  { label: "Bike", icon: Bike },
  { label: "Carpool", icon: Users },
  { label: "Walk", icon: Footprints },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold">How It Works</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          A clear, step-by-step flow from input to intelligent recommendation.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {steps.map((s, i) => (
          <Card key={s.title}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--color-chart-2)]/20 text-sm font-semibold">
                  {i + 1}
                </span>
                <h3 className="font-medium">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid items-center gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              {modes.map((m) => (
                <span
                  key={m.label}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2"
                >
                  <m.icon className="size-4 text-[var(--color-chart-2)]" aria-hidden="true" />
                  <span className="text-sm">{m.label}</span>
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrafficCone className="size-4 text-[var(--color-chart-4)]" aria-hidden="true" />
                  Real-time Traffic
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Congestion levels adjust expected time and route selection.
                </p>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CloudSun className="size-4 text-[var(--color-chart-2)]" aria-hidden="true" />
                  Live Weather
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Rain, heat, and wind factor into mode and comfort.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border p-5">
          <h4 className="font-medium">Flow Diagram</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Conceptual model of the assistant&apos;s decision pipeline.
          </p>
          <img
            src="/ai-decision-pipeline-diagram.jpg"
            alt="AI decision pipeline diagram"
            className="mt-4 w-full rounded border border-border object-cover"
          />
        </div>
      </div>
    </section>
  )
}
