import { Card, CardContent } from "@/components/ui/card"
import { Leaf, Wallet, Brain, Timer } from "lucide-react"

const items = [
  {
    title: "Eco-friendly",
    icon: Leaf,
    desc: "Lower your carbon footprint by choosing greener routes and modes.",
  },
  {
    title: "Affordable",
    icon: Wallet,
    desc: "Compare fuel, ticket, and toll costs to save money daily.",
  },
  {
    title: "Intelligent",
    icon: Brain,
    desc: "AI analyzes traffic, weather, and transit data to optimize your commute.",
  },
  {
    title: "Time-saving",
    icon: Timer,
    desc: "Get the fastest sustainable option without the guesswork.",
  },
]

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold">About the Project</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Our assistant helps you plan eco-conscious and cost-effective commutes using public transit, carpooling,
          cycling, or walking—balancing carbon output, time, and cost with real-time conditions.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {items.map((it) => (
          <Card key={it.title} className="border-border">
            <CardContent className="flex flex-col items-start gap-3 p-5">
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-[var(--color-chart-2)]/15">
                <it.icon className="size-5 text-[var(--color-chart-2)]" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-medium">{it.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
