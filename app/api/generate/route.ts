// app/api/generate/route.ts — javari-animal-rescue
// FREE for social impact users
// Powered by Javari AI free models
import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

const GROQ_API_KEY   = process.env.GROQ_API_KEY   ?? ''
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY ?? ''
const CREDIT_COST    = 0
const SYSTEM         = `You are an animal welfare specialist for CR AudioViz AI. Help animal rescues with adoption listings, volunteer coordination, fundraising content, grant applications, social media, and animal care guides.`
const ACTIONS        = ["adoption_listing", "fundraising_email", "grant_application", "volunteer_guide", "care_guide", "social_media_post", "donation_appeal"]

async function generate(prompt: string): Promise<string> {
  if (OPENROUTER_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENROUTER_KEY}`, 'HTTP-Referer': 'https://craudiovizai.com' },
        body: JSON.stringify({ model: 'deepseek/deepseek-v4-flash:free', max_tokens: 2048, temperature: 0.7, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }] }),
      })
      if (res.ok) { const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> }; const t = d.choices?.[0]?.message?.content ?? ''; if (t.length > 50) return t }
    } catch { /* fall through */ }
  }
  if (!GROQ_API_KEY) throw new Error('AI service unavailable')
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 2048, temperature: 0.7, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}`)
  const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  return d.choices?.[0]?.message?.content ?? ''
}

export async function GET() {
  return NextResponse.json({ actions: ACTIONS, cost: CREDIT_COST === 0 ? 'FREE' : CREDIT_COST + ' credits', model: 'Javari AI (free models)', cost_usd: '$0.00' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { action: string; input: string; context?: Record<string, string> }
    if (!body.input?.trim()) return NextResponse.json({ error: 'input required' }, { status: 400 })
    if (!ACTIONS.includes(body.action)) return NextResponse.json({ error: 'invalid action', available: ACTIONS }, { status: 400 })
    const result = await generate(`${body.action.replace(/_/g,' ')}: ${body.input}`)
    return NextResponse.json({ result, action: body.action, cost_usd: '$0.00', credits_used: CREDIT_COST, free: CREDIT_COST === 0 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
