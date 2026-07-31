// app/api/rescues/billing/checkout/route.ts
// A THIN proxy only - zero Stripe SDK, zero business logic. Exists purely
// because a direct browser fetch from javarirescue.com to craudiovizai.com
// would fail CORS (no Access-Control-Allow-Origin exists there). A
// server-to-server forward isn't subject to CORS at all. All real logic -
// price lookup, ownership check, session creation - lives in the ONE
// central endpoint this forwards to.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const res = await fetch("https://craudiovizai.com/api/payments/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ ...body, mode: "rescue_plan" }),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
