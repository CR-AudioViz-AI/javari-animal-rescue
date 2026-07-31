// app/api/rescues/route.ts
// The real rescue network: directory search, registration, and single-rescue
// lookup by slug. Reverted 2026-07-31: featured placement is derived from
// the owning user's REAL existing platform subscription (user_subscriptions
// .plan_tier), not a separate rescue-specific plan - a rescue registered by
// someone on Pro or Business is featured; there is no separate purchase.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function sb() {
  return createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });
}

const FEATURED_TIERS = new Set(["pro", "business"]);

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const client = sb();

  const slug = req.nextUrl.searchParams.get("slug");
  if (slug) {
    const { data, error } = await client.from("dog_rescues")
      .select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Rescue not found" }, { status: 404 });
    return NextResponse.json({ rescue: data });
  }

  const state = req.nextUrl.searchParams.get("state");
  let query = client.from("dog_rescues").select(
    "id,name,slug,city,state,website,description,logo_url,cover_url,mission,animals_served,verified,user_id"
  ).eq("active", true).eq("verified", true);
  if (state) query = query.eq("state", state);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rescues = data ?? [];

  // Look up the real subscription tier for each rescue's owner in one query,
  // rather than N+1 lookups.
  const ownerIds = [...new Set(rescues.map(r => r.user_id).filter(Boolean))];
  const { data: subs } = ownerIds.length
    ? await client.from("user_subscriptions").select("user_id, plan_tier, status").in("user_id", ownerIds)
    : { data: [] as { user_id: string; plan_tier: string; status: string }[] };
  const tierByUser = new Map((subs ?? []).filter(s => s.status === "active").map(s => [s.user_id, s.plan_tier]));

  const withFeatured = rescues.map(r => ({
    ...r,
    featured: FEATURED_TIERS.has(tierByUser.get(r.user_id) ?? ""),
  }));
  const sorted = withFeatured.sort((a, b) => Number(b.featured) - Number(a.featured));

  return NextResponse.json({
    rescues: sorted,
    disclosure: sorted.some(r => r.featured)
      ? "Rescues whose registered account is on the Pro or Business platform plan appear first in search results."
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

  // Free, instant registration - no plan, no checkout. Directory features
  // are computed at read time from the owner's real subscription above.
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
  }).select("id, slug").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
