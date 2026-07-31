// app/api/rescues/route.ts
// The real rescue network: directory search, registration, and single-rescue
// lookup by slug - built directly into this app (its own entity, own repo,
// own Vercel project) rather than depending on craudiovizai.com's copy,
// while still using the same shared Supabase project every app uses.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function sb() {
  return createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const client = sb();

  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    // Single rescue lookup - powers the public profile page.
    const { data, error } = await client.from("dog_rescues")
      .select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Rescue not found" }, { status: 404 });
    return NextResponse.json({ rescue: data });
  }

  // Directory search - featured (paid) rescues first, matching what their
  // plan actually pays for, not a hidden or arbitrary ranking.
  const state = req.nextUrl.searchParams.get("state");
  let query = client.from("dog_rescues").select(
    "id,name,slug,city,state,website,description,logo_url,cover_url,mission,animals_served,verified,plan"
  ).eq("active", true).eq("verified", true);
  if (state) query = query.eq("state", state);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const featuredPlans = new Set(["growth", "network"]);
  const sorted = (data ?? []).sort((a, b) => {
    const aFeatured = featuredPlans.has(a.plan) ? 1 : 0;
    const bFeatured = featuredPlans.has(b.plan) ? 1 : 0;
    return bFeatured - aFeatured;
  });

  return NextResponse.json({
    rescues: sorted,
    disclosure: sorted.some(r => featuredPlans.has(r.plan))
      ? "Rescues on our Growth or Network plan appear first in search results."
      : undefined,
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const client = sb();

  const h = req.headers.get("authorization");
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Sign in required to register a rescue" }, { status: 401 });
  const { data: { user } } = await client.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Organization name is required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50)
    + "-" + Math.random().toString(36).slice(2, 6);

  const { data, error } = await client.from("dog_rescues").insert({
    user_id: user.id,
    name,
    slug,
    city: body.city ?? null,
    state: body.state ?? null,
    website: body.website ?? null,
    email: body.email ?? user.email,
    phone: body.phone ?? null,
    description: body.description ?? null,
    mission: body.mission ?? null,
    ein: body.ein ?? null,
    nonprofit: !!body.nonprofit,
    verified: false,   // real verification is a manual/future step - never self-declared true
    active: true,
    plan: "starter",
    plan_status: "inactive",   // becomes active only once real payment succeeds
    credits: 0,
  }).select("id, slug").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
