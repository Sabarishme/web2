import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.anonymous_id || !body.fingerprintHash) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    const h = req.headers

    const location = {
      country: h.get("x-vercel-ip-country"),
      country_code: h.get("x-vercel-ip-country"),
      region: h.get("x-vercel-ip-country-region"),
      city: h.get("x-vercel-ip-city"),
      ip_timezone: h.get("x-vercel-ip-timezone"),
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      return NextResponse.json({
        demo: true,
        visitor: {
          ...body,
          ...location,
          last_seen: new Date().toISOString(),
        },
      })
    }

    const supabase = createClient(url, key)

    const { data, error } = await supabase
      .from("visitors")
      .upsert(
        {
          anonymous_id: body.anonymous_id,
          browser: body.browser,
          os: body.os,
          device: body.device,
          language: body.language,
          timezone: body.timezone,
          screen: body.screen,
          viewport: body.viewport,
          cpu: body.cpu,
          memory: body.memory,
          touch: body.touch,
          pixel_ratio: body.pixel_ratio,
          canvas_hash: body.canvas_hash,
          webgl: body.webgl,
          fingerprint_hash: body.fingerprintHash,

          country: location.country,
          country_code: location.country_code,
          region: location.region,
          city: location.city,
          ip_timezone: location.ip_timezone,

          last_seen: new Date().toISOString(),
        },
        {
          onConflict: "anonymous_id",
        }
      )
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
      visitors: [],
    })
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("last_seen", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    configured: true,
    visitors: (data || []).map((v) => ({
      ...v,
      live:
        Date.now() - new Date(v.last_seen).getTime() < 30000,
    })),
  })
}