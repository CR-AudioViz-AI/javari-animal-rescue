// app/api/rescues/billing/webhook/route.ts
// Without this, checkout would take a rescue's payment and never actually
// activate anything - the exact class of gap found and fixed elsewhere on
// the platform tonight. This is what actually sets plan_status='active' and
// grants the monthly credit allocation once Stripe confirms payment.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_SVC = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2024-06-20" });
const WEBHOOK_SECRET = process.env.STRIPE_RESCUE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!SB_URL || !SB_SVC) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const sb = createClient(SB_URL, SB_SVC, { auth: { persistSession: false } });

  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    // Fail closed if the signing secret isn't configured - never process an
    // unverified webhook body as if it were real.
    if (!WEBHOOK_SECRET) throw new Error("Webhook secret not configured");
    event = stripe.webhooks.constructEvent(rawBody, sig ?? "", WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const rescueId = session.metadata?.rescue_id;
    const plan = session.metadata?.plan;
    if (rescueId && plan) {
      const { data: planRow } = await sb.from("rescue_org_plans").select("monthly_credits").eq("plan", plan).maybeSingle();
      await sb.from("dog_rescues").update({
        plan,
        plan_status: "active",
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        credits: planRow?.monthly_credits ?? 0,
        onboarded_at: new Date().toISOString(),
      }).eq("id", rescueId);
    }
  }

  if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled";
    await sb.from("dog_rescues").update({ plan_status: status }).eq("stripe_subscription_id", sub.id);
  }

  return NextResponse.json({ received: true });
}
