import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const h = req.headers
    const location = {
      country: h.get("x-vercel-ip-country"),
      country_code: h.get("x-vercel-ip-country"),
      region: h.get("x-vercel-ip-country-region"),
      city: h.get("x-vercel-ip-city"),
      ip_timezone: h.get("x-vercel-ip-timezone")
    }

    if (!body.anonymous_id || !body.fingerprintHash) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      return NextResponse.json({
        demo: true,
        visitor: {
          ...body,
          last_seen: new Date().toISOString()
        }
      })
    }

    const supabase = createClient(url, key)

    const { data, error } = await supabase
      .from("visitors")
      .upsert({
        ...body,
        last_seen: new Date().toISOString()
      }, {
        onConflict: "anonymous_id"
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ visitor: data })
  } catch {
    return NextResponse.json(
      { error: "Bad request" },
      { status: 400 }
    )
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({
      configured: false,
      visitors: []
    })
  }

  const supabase = createClient(url, key)

  const { data } = await supabase
    .from("visitors")
    .select("*")
    .order("last_seen", { ascending: false })
    .limit(50)

  return NextResponse.json({
    configured: true,
    visitors: (data || []).map(v => ({
    ...v,
    live: Date.now() - new Date(v.last_seen).getTime() < 30000
  }))
  })
}
