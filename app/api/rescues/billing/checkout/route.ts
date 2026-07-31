// app/api/rescues/billing/checkout/route.ts
// Real Stripe checkout for a rescue organization's plan - a separate
// transaction from an individual user's personal credits, matching the
// plan/credits columns already designed into dog_rescues but never wired to
// real payment. This is what the org itself pays for its directory listing,
// own profile page, and monthly AI tool credit allocation.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });

  const h = req.headers.get("authorization");
  const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: { rescue_id?: string; plan?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  if (!body.rescue_id || !body.plan) return NextResponse.json({ error: "rescue_id and plan are required" }, { status: 400 });

  // Confirm this rescue actually belongs to the requesting user - never let
  // someone pay for (or claim) a listing that isn't theirs.
  const { data: rescue } = await sb.from("dog_rescues")
    .select("id, name, user_id, stripe_customer_id").eq("id", body.rescue_id).maybeSingle();
  if (!rescue || rescue.user_id !== user.id) {
    return NextResponse.json({ error: "Rescue not found or not owned by you" }, { status: 403 });
  }

  const { data: planRow } = await sb.from("rescue_org_plans").select("*").eq("plan", body.plan).maybeSingle();
  if (!planRow) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  if (!planRow.stripe_price_id) return NextResponse.json({ error: "Plan is not yet configured for checkout" }, { status: 500 });

  const origin = req.headers.get("origin") ?? "https://javarirescue.com";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: rescue.stripe_customer_id ?? undefined,
    customer_email: rescue.stripe_customer_id ? undefined : user.email,
    // Fixed 2026-07-31: was using inline price_data (ad-hoc, unregistered
    // pricing) instead of a real Stripe Price - every plan now has a real
    // Product and Price registered in Stripe, referenced here directly.
    line_items: [{ price: planRow.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/rescue/manage?checkout=success`,
    cancel_url: `${origin}/rescue/manage?checkout=canceled`,
    metadata: { rescue_id: rescue.id, plan: body.plan },
  });

  return NextResponse.json({ ok: true, checkout_url: session.url });
}
