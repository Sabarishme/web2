"use client"

import { useEffect, useState } from "react"
import {
  Fingerprint,
  Globe,
  Monitor,
  Cpu,
  Clock,
  Smartphone,
  Activity,
  Shield,
  MemoryStick
} from "lucide-react"

import { collectFingerprint } from "@/lib/fingerprint"
import type { Visitor } from "@/lib/types"

function getID() {
  const key = "fingerprint-observer-id"
  let id = localStorage.getItem(key)

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }

  return id
}

function Card({
  icon: Icon,
  name,
  value
}: {
  icon: any
  name: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
        <Icon size={16} />
        {name}
      </div>
      <div className="truncate text-lg font-semibold">
        {value}
      </div>
    </div>
  )
}

export default function Home() {
  const [me, setMe] = useState<Visitor | null>(null)
  const [visitors, setVisitors] = useState<Visitor[]>([])

  async function update() {
    const fp = await collectFingerprint()

    const visitor = {
      ...fp,
      anonymous_id: getID()
    }

    const r = await fetch("/api/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitor)
    })

    const data = await r.json()

    if (data.visitor) {
      setMe(data.visitor)
    }

    const list = await fetch("/api/visitor", {
      cache: "no-store"
    })

    const result = await list.json()

    if (result.visitors) {
      setVisitors(result.visitors)
    }
  }

  useEffect(() => {
    update()

    const timer = setInterval(update, 15000)

    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10">

        <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
                <Fingerprint />
              </div>

              <h1 className="text-3xl font-bold">
                Fingerprint Observatory
              </h1>
            </div>

            <p className="mt-3 text-zinc-500">
              Live browser fingerprint visualization
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-3">
            <Activity className="text-emerald-400" size={18} />
            <span className="text-emerald-400">
              {visitors.length} visitors
            </span>
          </div>

        </header>

        <section className="mb-10">

          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Fingerprint className="text-emerald-400" />
            Your fingerprint
          </h2>

          {me && (
            <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
    <div className="flex items-center gap-2 text-green-400">
      <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse"></span>
      <span className="font-semibold">Live Visitor Monitor</span>
    </div>
    <p className="mt-2 text-sm text-zinc-400">
      Visitors active within the last 30 seconds
    </p>
  </div>

  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Card icon={Globe} name="Browser" value={me.browser} />

              <Card icon={Monitor} name="OS" value={me.os} />

              <Card icon={Smartphone} name="Device" value={me.device} />

              <Card icon={Globe} name="Language" value={me.language} />

              <Card icon={Clock} name="Timezone" value={me.timezone} />

              <Card icon={Monitor} name="Screen" value={me.screen} />

              <Card icon={Monitor} name="Viewport" value={me.viewport} />

              <Card
                icon={Cpu}
                name="CPU threads"
                value={String(me.cpu ?? "N/A")}
              />

              <Card
                icon={MemoryStick}
                name="Memory"
                value={me.memory ? String(me.memory) + " GB" : "N/A"}
              />

              <Card
                icon={Monitor}
                name="Pixel ratio"
                value={String(me.pixelRatio)}
              />

              <Card
                icon={Fingerprint}
                name="Fingerprint"
                value={me.fingerprintHash.slice(0, 16) + "..."}
              />

              <Card
                icon={Shield}
                name="Canvas"
                value={me.canvasHash ? "Detected" : "Unavailable"}
              />

            </div>
          )}

        </section>

        <section>

          <h2 className="mb-4 text-xl font-semibold">
            Live visitors
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/10">

            {visitors.length === 0 && (
              <div className="p-10 text-center text-zinc-500">
                Waiting for visitors...
              </div>
            )}

            {visitors.map(v => (
              <div
                key={v.anonymous_id}
                className="flex flex-col gap-3 border-b border-white/10 bg-white/[.02] p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="font-mono text-sm text-emerald-400">
                    {v.fingerprintHash.slice(0, 16)}...
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    anonymous visitor
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <span>{v.browser}</span>
                  <span>{v.os}</span>
                  <span>{v.device}</span>
                  <span>{v.language}</span>
                  <span>{v.timezone}</span>
                </div>
              </div>
            ))}

          </div>

        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[.02] p-6">

          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            <h2 className="font-semibold">Privacy</h2>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            This project does not intentionally collect IP addresses,
            names, emails, passwords, GPS coordinates, cookies, or
            browsing history. Browser fingerprints can change and are
            not guaranteed to uniquely identify a person.
          </p>

        </section>

      </div>
    </main>
  )
}
