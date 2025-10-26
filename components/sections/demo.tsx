"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ResultItem = {
  mode: string
  distanceKm: number
  timeMins: number
  carbonKg: number
  energySavedKWh: number
}

type AnalyzeResponse = {
  suggestedMode: string
  suggested: ResultItem
  results: ResultItem[]
}

export function Demo() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [busy, setBusy] = useState(false)

  function computeSuggestion(a: string, b: string): AnalyzeResponse {
    const seed = (a + b).length
    // Lightweight, deterministic mock "AI" for demo purposes only
    const options: ResultItem[] = [
      { mode: "Walking", distanceKm: 2.5, timeMins: 30, carbonKg: 0.0, energySavedKWh: 1.45 },
      { mode: "Bicycling", distanceKm: 5.2, timeMins: 24, carbonKg: 0.0, energySavedKWh: 3.02 },
      { mode: "Transit", distanceKm: 8.1, timeMins: 28, carbonKg: 0.57, energySavedKWh: 3.72 },
      { mode: "Driving", distanceKm: 8.1, timeMins: 22, carbonKg: 1.39, energySavedKWh: 0.0 },
    ]
    const suggested = options[seed % options.length]
    return { suggestedMode: suggested.mode, suggested, results: options }
  }

  function normalizePlace(q: string) {
    let s = q.trim()
    // Common aliases
    s = s.replace(/\bmahabalipuram\b/i, "Mamallapuram")
    return s
  }

  function isIndiaQuery(q: string) {
    const s = q.toLowerCase()
    if (s.includes("india")) return true
    const states = [
      "andhra", "arunachal", "assam", "bihar", "chhattisgarh", "goa", "gujarat", "haryana", "himachal",
      "jharkhand", "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram",
      "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana", "tripura", "uttar",
      "uttarakhand", "west bengal", "delhi", "pondicherry", "puducherry", "chennai", "mumbai", "kolkata",
      "bengaluru", "hyderabad"
    ]
    return states.some((w) => s.includes(w))
  }

  async function geocode(q: string): Promise<{ lat: number; lon: number }> {
    const q1 = normalizePlace(q)
    const inIN = isIndiaQuery(q1)
    const base = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q1)}&format=jsonv2&limit=5&addressdetails=1&accept-language=en${inIN ? "&countrycodes=in" : ""}`
    const r = await fetch(base)
    const arr = await r.json()
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("geocode failed")
    const preferredTypes = new Set(["city","town","village","municipality","hamlet","suburb"]) 
    const place = arr.find((x: any) => x.class === 'place' && preferredTypes.has(x.type)) || arr[0]
    return { lat: parseFloat(place.lat), lon: parseFloat(place.lon) }
  }

  async function osrmRoute(profile: "driving" | "cycling" | "foot", a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    // Prefer local OSRM if running, else use public; ask for alternatives and speeds
    const qs = "overview=false&alternatives=true&steps=false&annotations=speed"
    const local = `http://localhost:5000/route/v1/${profile}/${a.lon},${a.lat};${b.lon},${b.lat}?${qs}`
    const publicUrl = `https://router.project-osrm.org/route/v1/${profile}/${a.lon},${a.lat};${b.lon},${b.lat}?${qs}`
    let r: Response | null = null
    if (process.env.NEXT_PUBLIC_USE_LOCAL_OSRM === "1") {
      r = await fetch(local).catch(() => null as any)
    }
    if (!r || !r.ok) r = await fetch(publicUrl)
    const j = await r.json()
    if (j.code !== "Ok") throw new Error("osrm failed")
    // Choose route that most likely follows highways: highest share of high-speed segments
    const routes = j.routes as any[]
    const pick = (routes || []).map((rt) => {
      const speeds: number[] = (rt.legs || []).flatMap((lg: any) => (lg.annotation?.speed || []))
      const hi = speeds.length ? speeds.filter((s) => s >= 22.22).length / speeds.length : 0 // >=80 km/h
      return { rt, hi }
    }).sort((a, b) => b.hi - a.hi || a.rt.duration - b.rt.duration)[0]?.rt || j.routes[0]
    return { distanceKm: Math.round((pick.distance / 1000) * 100) / 100, timeMins: Math.round(pick.duration / 60) }
  }

  function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLon = ((b.lon - a.lon) * Math.PI) / 180
    const la1 = (a.lat * Math.PI) / 180
    const la2 = (b.lat * Math.PI) / 180
    const h =
      Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(h))
  }

  async function otpTransit(
    A: { lat: number; lon: number },
    B: { lat: number; lon: number },
    transitModes: string
  ): Promise<{ distanceKm: number; timeMins: number } | null> {
    const base = "http://localhost:8081/otp/routers/default/plan"
    const params = new URLSearchParams({
      fromPlace: `${A.lat},${A.lon}`,
      toPlace: `${B.lat},${B.lon}`,
      mode: "TRANSIT,WALK",
      transitModes,
      numItineraries: "1",
    })
    try {
      const r = await fetch(`${base}?${params.toString()}`)
      if (!r.ok) return null
      const j = await r.json()
      const itin = j.plan?.itineraries?.[0]
      if (!itin) return null
      const distance = (itin.legs || []).reduce((acc: number, l: any) => acc + (l.distance || 0), 0)
      return { distanceKm: Math.round((distance / 1000) * 100) / 100, timeMins: Math.round((itin.duration || 0) / 60) }
    } catch {
      return null
    }
  }

  function energySaved(distanceKm: number, mode: keyof typeof kwh) {
    const delta = kwh.car - kwh[mode]
    let saved = distanceKm * Math.max(0, delta)
    if (saved > 0 && saved < 0.05) saved = 0.05 // ensure a small positive value when applicable
    return +saved.toFixed(3)
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!from.trim() || !to.trim()) return
    setBusy(true)
    try {
      // Try Java backend first
      try {
        const res = await fetch(`${API_BASE}/api/commute/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from, to }),
        })
        if (res.ok) {
          const data: AnalyzeResponse = await res.json()
          setResult(data)
          return
        }
      } catch {}

      const [A, B] = await Promise.all([geocode(from), geocode(to)])
      const [car, bike, foot] = await Promise.all([
        osrmRoute("driving", A, B),
        osrmRoute("cycling", A, B),
        osrmRoute("foot", A, B),
      ])

      // Try local OTP for precise transit distances if available
      const trainOtp = await otpTransit(A, B, "RAIL")
      const metroOtp = await otpTransit(A, B, "SUBWAY")
      const busOtp = await otpTransit(A, B, "BUS")

      const airDist = Math.round(haversine(A, B) * 100) / 100
      const airMins = Math.round((airDist / 850) * 60 + 60)
      const speed = { bus: 28, train: 90, metro: 35, moto: 50 }
      const TRAIN_DISTANCE_FACTOR = 1.18
      const trainDist = trainOtp?.distanceKm ?? Math.round(airDist * TRAIN_DISTANCE_FACTOR * 100) / 100
      const metroDist = metroOtp?.distanceKm ?? airDist
      const busDist = busOtp?.distanceKm ?? car.distanceKm

      const carbon = {
        car: 0.171,
        moto: 0.103,
        bus: 0.07,
        train: 0.041,
        metro: 0.05,
        walkbike: 0,
        air: 0.255,
      }
      const kwh = { car: 0.58, moto: 0.25, bus: 0.12, train: 0.08, metro: 0.06, walkbike: 0, air: 0.9 }

      const items: ResultItem[] = [
        { mode: "Car", distanceKm: car.distanceKm, timeMins: car.timeMins, carbonKg: +(car.distanceKm * carbon.car).toFixed(3), energySavedKWh: 0 },
        { mode: "Motorcycle", distanceKm: car.distanceKm, timeMins: Math.round((car.distanceKm / speed.moto) * 60), carbonKg: +(car.distanceKm * carbon.moto).toFixed(3), energySavedKWh: energySaved(car.distanceKm, 'moto') },
        { mode: "Bus", distanceKm: busDist, timeMins: Math.round((busDist / speed.bus) * 60), carbonKg: +(busDist * carbon.bus).toFixed(3), energySavedKWh: energySaved(busDist, 'bus') },
        { mode: "Train", distanceKm: trainDist, timeMins: (trainOtp?.timeMins ?? Math.round((trainDist / speed.train) * 60 + 20)), carbonKg: +(trainDist * carbon.train).toFixed(3), energySavedKWh: energySaved(trainDist, 'train') },
        { mode: "Metro", distanceKm: metroDist, timeMins: metroOtp?.timeMins ?? (metroDist <= 40 ? Math.round((metroDist / speed.metro) * 60 + 10) : 999999), carbonKg: +(metroDist * carbon.metro).toFixed(3), energySavedKWh: (metroDist <= 40 ? energySaved(metroDist, 'metro') : 0) },
        { mode: "Cycle", distanceKm: bike.distanceKm, timeMins: bike.timeMins, carbonKg: 0, energySavedKWh: energySaved(bike.distanceKm, 'walkbike') },
        { mode: "Walking", distanceKm: foot.distanceKm, timeMins: foot.timeMins, carbonKg: 0, energySavedKWh: energySaved(foot.distanceKm, 'walkbike') },
        { mode: "Aeroplane", distanceKm: airDist, timeMins: airMins, carbonKg: +(airDist * carbon.air).toFixed(3), energySavedKWh: 0 },
      ]

      // Apply logical constraints
      const MAX_WALK_KM = 8
      const MAX_CYCLE_KM = 25
      const MAX_METRO_KM = 60
      const MAX_MOTO_KM = 200
      const MAX_BUS_KM = 800
      const MAX_CAR_KM = 1200
      const logical = items.filter((i) => {
        const m = i.mode.toLowerCase()
        if (m === 'walking' && i.distanceKm > MAX_WALK_KM) return false
        if (m === 'cycle' && i.distanceKm > MAX_CYCLE_KM) return false
        // keep aeroplane in list, but we may down-rank it for short trips
        if (m === 'metro' && i.distanceKm > MAX_METRO_KM) return false
        if (m === 'motorcycle' && i.distanceKm > MAX_MOTO_KM) return false
        if (m === 'bus' && i.distanceKm > MAX_BUS_KM) return false
        if (m === 'car' && i.distanceKm > MAX_CAR_KM) return false
        return true
      })

      const feasible = logical.filter(i => i.timeMins < 999999)
      // Prefer not to suggest aeroplane for short trips (<500 km) but still show it as an alternative
      const candidates = feasible.filter(i => !(i.mode === 'Aeroplane' && i.distanceKm < 500))
      const pool = candidates.length ? candidates : feasible
      const suggested = pool.sort((a,b)=> a.carbonKg*2 + a.timeMins - (b.carbonKg*2 + b.timeMins))[0]
      setResult({ suggestedMode: suggested.mode, suggested, results: logical })
    } catch (err) {
      try {
        // Fallback: use geodesic distance only with assumed speeds if routing fails
        const [A, B] = await Promise.all([geocode(from), geocode(to)])
        const airDist = Math.round(haversine(A, B) * 100) / 100
        const speed = { car: 55, moto: 50, bus: 28, train: 90, metro: 35, walk: 5, bike: 12 }
        const carbon = { car: 0.171, moto: 0.103, bus: 0.07, train: 0.041, metro: 0.05, walkbike: 0, air: 0.255 }
        const kwh = { car: 0.58, moto: 0.25, bus: 0.12, train: 0.08, metro: 0.06, walkbike: 0, air: 0.9 }
        const TRAIN_DISTANCE_FACTOR = 1.18
        const trainDist = Math.round(airDist * TRAIN_DISTANCE_FACTOR * 100) / 100
        const items: ResultItem[] = [
          { mode: "Car", distanceKm: airDist, timeMins: Math.round((airDist / speed.car) * 60), carbonKg: +(airDist * carbon.car).toFixed(3), energySavedKWh: 0 },
          { mode: "Motorcycle", distanceKm: airDist, timeMins: Math.round((airDist / speed.moto) * 60), carbonKg: +(airDist * carbon.moto).toFixed(3), energySavedKWh: Math.max(0.05, +(Math.max(0, airDist * (kwh.car - kwh.moto))).toFixed(3) as unknown as number) },
          { mode: "Bus", distanceKm: airDist, timeMins: Math.round((airDist / speed.bus) * 60), carbonKg: +(airDist * carbon.bus).toFixed(3), energySavedKWh: Math.max(0.05, +(Math.max(0, airDist * (kwh.car - kwh.bus))).toFixed(3) as unknown as number) },
          { mode: "Train", distanceKm: trainDist, timeMins: Math.round((trainDist / speed.train) * 60 + 20), carbonKg: +(trainDist * carbon.train).toFixed(3), energySavedKWh: Math.max(0.05, +(Math.max(0, trainDist * (kwh.car - kwh.train))).toFixed(3) as unknown as number) },
          { mode: "Metro", distanceKm: airDist, timeMins: airDist <= 40 ? Math.round((airDist / speed.metro) * 60 + 10) : 999999, carbonKg: +(airDist * carbon.metro).toFixed(3), energySavedKWh: airDist <= 40 ? Math.max(0.05, +(Math.max(0, airDist * (kwh.car - kwh.metro))).toFixed(3) as unknown as number) : 0 },
          { mode: "Cycle", distanceKm: airDist, timeMins: Math.round((airDist / speed.bike) * 60), carbonKg: 0, energySavedKWh: Math.max(0.05, +(Math.max(0, airDist * (kwh.car - kwh.walkbike))).toFixed(3) as unknown as number) },
          { mode: "Walking", distanceKm: airDist, timeMins: Math.round((airDist / speed.walk) * 60), carbonKg: 0, energySavedKWh: Math.max(0.05, +(Math.max(0, airDist * (kwh.car - kwh.walkbike))).toFixed(3) as unknown as number) },
          { mode: "Aeroplane", distanceKm: airDist, timeMins: Math.round((airDist / 850) * 60 + 60), carbonKg: +(airDist * carbon.air).toFixed(3), energySavedKWh: 0 },
        ]

        const MAX_WALK_KM = 8
        const MAX_CYCLE_KM = 25
        const MAX_METRO_KM = 60
        const MAX_MOTO_KM = 200
        const MAX_BUS_KM = 800
        const MAX_CAR_KM = 1200
        const logical = items.filter((i) => {
          const m = i.mode.toLowerCase()
          if (m === 'walking' && i.distanceKm > MAX_WALK_KM) return false
          if (m === 'cycle' && i.distanceKm > MAX_CYCLE_KM) return false
          // keep aeroplane in list, but down-rank for short trips
          if (m === 'metro' && i.distanceKm > MAX_METRO_KM) return false
          if (m === 'motorcycle' && i.distanceKm > MAX_MOTO_KM) return false
          if (m === 'bus' && i.distanceKm > MAX_BUS_KM) return false
          if (m === 'car' && i.distanceKm > MAX_CAR_KM) return false
          return true
        })

        const feasible = logical.filter(i => i.timeMins < 999999)
        const candidates = feasible.filter(i => !(i.mode === 'Aeroplane' && i.distanceKm < 500))
        const pool = candidates.length ? candidates : feasible
        const suggested = pool.sort((a,b)=> a.carbonKg*2 + a.timeMins - (b.carbonKg*2 + b.timeMins))[0]
        setResult({ suggestedMode: suggested.mode, suggested, results: logical })
      } catch {
        setResult(computeSuggestion(from, to))
      }
    } finally {
      setBusy(false)
    }
  }

  const progressStyle = useMemo(() => {
    return { width: `${Math.min(100, Math.max(0, 100 - (result?.suggested.carbonKg ?? 0) * 10))}%` }
  }, [result])

  const alternatives = useMemo(() => {
    if (!result) return [] as ResultItem[]
    const friendlyRank = (m: string) => {
      const x = m.toLowerCase()
      if (["bus","train","metro","cycle","walking"].includes(x)) return 0
      if (x === "motorcycle") return 1
      if (x === "car") return 2
      return 3 // aeroplane or others
    }
    const scored = result.results
      .filter((r) => r.mode !== result.suggestedMode && r.timeMins < 999999)
      .map((r) => ({
        ...r,
        _score: [-r.energySavedKWh, friendlyRank(r.mode), r.timeMins] as [number, number, number],
      }))
      .sort((a, b) => {
        for (let i = 0; i < a._score.length; i++) {
          if (a._score[i] !== b._score[i]) return a._score[i] - b._score[i]
        }
        return 0
      })
      .map(({ _score, ...rest }) => rest)

    // Ensure Bus appears if feasible
    const hasBus = scored.find((r) => r.mode.toLowerCase() === "bus")
    let top = scored.slice(0, 3)
    if (!top.find((r) => r.mode.toLowerCase() === "bus") && hasBus) {
      top = [hasBus, ...top.filter((r) => r.mode.toLowerCase() !== "bus").slice(0, 2)]
    }
    return top
  }, [result])

  return (
    <section id="demo" className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-3xl font-semibold">Try the Demo</h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          Enter a sample route. We&apos;ll showcase a mock recommendation with time, cost, and carbon savings.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan a Commute</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  placeholder="e.g., Indiranagar"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder="e.g., Electronic City"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="bg-[var(--color-chart-2)] text-[var(--color-primary-foreground)] hover:opacity-90"
              >
                {busy ? "Calculating..." : "Get Suggestion"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-sm text-muted-foreground">Your results will appear here after submitting the form.</p>
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Suggested mode</span>
                  <Badge variant="secondary">{result.suggestedMode}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time</span>
                  <span className="font-medium">{result.suggested.timeMins} mins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="font-medium">{result.suggested.distanceKm} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                  <span className="font-medium">{result.suggested.carbonKg} kg CO₂</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Energy Saved</span>
                  <span className="font-medium">{result.suggested.energySavedKWh} kWh</span>
                </div>

                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>Eco Score</span>
                    <span className="font-medium">{Math.max(0, 100 - Math.round((result.suggested.carbonKg || 0) * 10))}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded bg-muted">
                    <div
                      className="h-full rounded bg-[var(--color-chart-2)]"
                      style={progressStyle}
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={result.suggested.carbonKg}
                      aria-label="Eco score"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Higher is better. Based on carbon savings, time, and cost balance.
                  </p>
                </div>

                {alternatives.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-sm font-medium">Also available</div>
                    <div className="grid gap-2">
                      {alternatives.map((opt) => (
                        <div key={opt.mode} className="flex items-center justify-between text-sm">
                          <span className="inline-flex items-center gap-2">
                            <Badge variant="outline">{opt.mode}</Badge>
                          </span>
                          <span className="text-muted-foreground">
                            {opt.distanceKm} km • {opt.timeMins} mins • {opt.carbonKg} kg CO₂
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
