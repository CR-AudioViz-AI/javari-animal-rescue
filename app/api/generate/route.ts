// app/api/generate/route.ts — javari-animal-rescue
// 8 specialized AI tools for animal rescue organizations
// FREE tier — powered by Groq (fastest free LLM inference)
// Competitor advantages over PetPoint, Shelterluv, DonorPerfect
// CR AudioViz AI · EIN 39-3646201 · June 2026
import { NextRequest, NextResponse } from 'next/server'
import { requireCredits } from '@/lib/credits-check'

async function callGemini(text: string): Promise<string> {
  const key = process.env.GOOGLE_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? ''
  if (!key) return ''
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
        }),
      },
    )
    if (!res.ok) return ''
    const d = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    return d.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  } catch {
    return ''
  }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const GROQ_KEY = process.env.GROQ_API_KEY ?? process.env.OPENROUTER_API_KEY ?? ''

async function callGroq(system: string, user: string): Promise<string> {
  // Try Groq first (fastest, free)
  if (process.env.GROQ_API_KEY) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Authorization':`Bearer ${process.env.GROQ_API_KEY}`},
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{role:'system',content:system},{role:'user',content:user}],
        max_tokens: 1200, temperature: 0.7,
      })
    })
    const d = await res.json() as {choices?:{message:{content:string}}[]}
    if (d.choices?.[0]?.message?.content) return d.choices[0].message.content
  }
  // Fallback: OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Authorization':`Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer':'https://craudiovizai.com','X-Title':'Javari Animal Rescue'},
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{role:'system',content:system},{role:'user',content:user}],
        max_tokens: 1200,
      })
    })
    const d = await res.json() as {choices?:{message:{content:string}}[]}
    if (d.choices?.[0]?.message?.content) return d.choices[0].message.content
  }
  // 2026-08-15: Gemini was missing from the cascade entirely, so a Groq 429
  // became a 500 the customer saw. Free tier two of the COST LAW.
  const gem = await callGemini(system + '\n' + user)
  if (gem.length > 20) return gem

  throw new Error('No AI provider available')
}

const SYSTEM = `You are Javari, an expert AI assistant for animal rescue organizations, shelters, and foster networks. You help with adoptions, fundraising, grant writing, volunteer management, and animal care. Your content is compassionate, professional, and optimized to get animals adopted and organizations funded. Always produce ready-to-use content — no placeholders, no instructions needed.`

function buildPrompt(action: string, fields: Record<string,string>): string {
  const f = (k: string) => fields[k] ?? ''
  const prompts: Record<string, string> = {
    adoption: `Write a compelling adoption bio for ${f('Animal Name')}, a ${f('Species/Breed')}, ${f('Age')} old. Personality: ${f('Personality')}. Background: ${f('Special needs or story')}. Make it emotional, vivid, and end with a clear call-to-action. Use sub-headers. 350-500 words.`,
    
    grant: `Write a complete grant application for ${f('Organization name')} requesting ${f('Grant amount needed')} to fund: ${f('Program to fund')}. They help ${f('Annual animals helped')} animals annually. Mission: ${f('Mission statement')}. Include: Executive Summary, Statement of Need, Program Description, Goals & Outcomes, Budget Narrative, Organizational Capacity. 600-800 words.`,
    
    donor: `Write a fundraising email to ${f('Donor name')} asking for ${f('Donation ask')} for ${f('Rescue name')}. Urgency: ${f('Urgency')}. Impact story: ${f('Impact story')}. Make it emotional but not manipulative. Include: compelling subject line (3 options), personalized opening, impact story, specific ask, easy response options. Ready to send.`,
    
    social: `Write 3 social media posts for ${f('Animal Name')}, a ${f('Species/breed')} with this personality: ${f('Personality')}. Located at ${f('Rescue location')}. Platform: ${f('Platform')}. Each post: emoji-rich, call-to-action, relevant hashtags (15 max), optimized for shares. Label each post clearly.`,
    
    volunteer: `Write a volunteer recruitment package for ${f('Rescue name')} seeking: ${f('Role needed')}. Commitment: ${f('Commitment')}. Responsibilities: ${f('What they do')}. Benefits: ${f('Benefits')}. Include: Job title + description, Requirements (light), What you'll do, Perks & recognition, How to apply CTA. Make it exciting and warm.`,
    
    care: `Write a detailed care guide for: ${f('Animal/species')}. Situation: ${f('Situation')}. Questions to answer: ${f('Questions')}. Include: Feeding schedule, Housing/environment, Health monitoring, Socialization, Red flags to watch, When to contact vet, Resources. Make it practical for a first-time foster.`,
    
    newsletter: `Write a monthly rescue newsletter for ${f('Month/theme')} for ${f('Rescue name')}. Success stories: ${f('Success stories')}. Upcoming events: ${f('Upcoming events')}. Urgent needs: ${f('Urgent needs')}. Include: Subject line (3 options), warm opener, success spotlight, urgent needs section, events calendar, donation CTA, closing. ~500 words.`,
    
    policy: `Draft a professional ${f('Document type')} for ${f('Organization name')} in ${f('State')}. Special requirements: ${f('Special clauses')}. Make it legally sound (note: not legal advice), comprehensive, and protect both the organization and the animals. Include all standard clauses plus the requested special terms.`,
  }
  return prompts[action] ?? `Generate professional content for animal rescue: action=${action}, details=${JSON.stringify(fields)}`
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json() as {action:string; fields:Record<string,string>}
    const { action, fields } = body
    if (!action) return NextResponse.json({error:'action required'},{status:400})

    // Fixed 2026-07-31, per Roy: every app ties into the shared platform
    // credit system, no exceptions - this tool was previously running fully
    // free, unlimited, and unauthenticated despite this exact check already
    // being written and sitting unused in lib/credits-check.ts.
    const check = await requireCredits(req, 5, `animal_rescue_${action}`)
    if (!check.allowed) return check.response!

    const prompt = buildPrompt(action, fields)
    const result = await callGroq(SYSTEM, prompt)
    return NextResponse.json({result, action, generated_at: new Date().toISOString()})
  } catch(e) {
    console.error('Generate error:', e)
    return NextResponse.json({error:'Generation failed — please try again'},{status:500})
  }
}
