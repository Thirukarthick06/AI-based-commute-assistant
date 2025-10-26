import { Card, CardContent } from "@/components/ui/card"

const members = [
  { name: "Member One", role: "Project Lead" },
  { name: "Member Two", role: "AI Engineer" },
  { name: "Member Three", role: "Frontend Dev" },
  { name: "Member Four", role: "Backend Dev" },
]

export function Team() {
  return (
    <section id="team" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold">Team</h2>
        <p className="mt-3 text-pretty text-muted-foreground">The people behind the assistant.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {members.map((m) => (
          <Card key={m.name}>
            <CardContent className="p-5 text-center">
              <img
                src="/professional-headshot.png"
                alt=""
                className="mx-auto size-24 rounded-full border border-border"
              />
              <h3 className="mt-3 font-medium">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
