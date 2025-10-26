"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="#hero" className="inline-flex items-center gap-2">
          <span className="inline-block size-6 rounded-sm bg-[var(--color-chart-2)]" aria-hidden="true" />
          <span className="font-semibold text-pretty">AI Commute Assistant</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <a href="#about" className="hover:opacity-80">
            About
          </a>
          <a href="#how-it-works" className="hover:opacity-80">
            How it works
          </a>
          <a href="#features" className="hover:opacity-80">
            Features
          </a>
          <a href="#demo" className="hover:opacity-80">
            Demo
          </a>
          <a href="#tech" className="hover:opacity-80">
            Tech
          </a>
          <a href="#team" className="hover:opacity-80">
            Team
          </a>
          <a href="#contact" className="hover:opacity-80">
            Contact
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
