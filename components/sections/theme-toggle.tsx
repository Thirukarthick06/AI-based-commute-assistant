"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    setDark(root.classList.contains("dark"))
  }, [])

  function toggle() {
    const root = document.documentElement
    const isDark = root.classList.toggle("dark")
    setDark(isDark)
  }

  return (
    <Button variant="outline" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
      {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </Button>
  )
}
