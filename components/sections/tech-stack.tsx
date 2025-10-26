import { Card, CardContent } from "@/components/ui/card"
import { Code2, Cloud, Database, Cpu } from "lucide-react"

export function TechStack() {
  return (
    <section id="tech" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold">Tech Stack</h2>
        <p className="mt-3 text-pretty text-muted-foreground">A modern web stack with AI and live data integrations.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Code2 className="size-5 text-[var(--color-chart-2)]" aria-hidden="true" />
              <h3 className="font-medium">Frontend</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">React, Next.js, Tailwind CSS</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Cloud className="size-5 text-[var(--color-chart-2)]" aria-hidden="true" />
              <h3 className="font-medium">APIs</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Maps, Weather, Traffic</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Cpu className="size-5 text-[var(--color-chart-2)]" aria-hidden="true" />
              <h3 className="font-medium">AI</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">OpenAI/ML-based route optimization</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Database className="size-5 text-[var(--color-chart-2)]" aria-hidden="true" />
              <h3 className="font-medium">Backend</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Node.js/Python, REST</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
