import { Github, Linkedin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 AI Commute Assistant | Designed by Your Team Name
          </p>

          <div className="flex items-center gap-3">
            <a
              href="mailto:hello@example.com"
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
            >
              Contact
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-accent"
            >
              <Github className="size-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-accent"
            >
              <Linkedin className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Built for college/tech expo presentation. Demo data only.
        </div>
      </div>
    </footer>
  )
}
