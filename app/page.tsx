// app/page.tsx — Javari Animal Rescue
// Complete working AI tools for animal rescue organizations — always free
// Real AI calls to /api/generate. Real outputs. No fake data.
// CR AudioViz AI, LLC · EIN 39-3646201 · May 2026
'use client'
import { useState, useRef, useEffect } from 'react'

const ACTIONS = [
  { id: 'adoption_listing',  label: '🐕 Adoption Listing',   desc: 'Write a compelling adoption profile for an animal',       prompt: (v: V) => `Write a heartfelt, detailed adoption listing for: ${v.animalName || 'the animal'}, ${v.breed || ''}, ${v.age || ''}, personality: ${v.personality || ''}. Include their story, temperament, ideal home, and a compelling CTA.` },
  { id: 'grant_application', label: '📋 Grant Application',   desc: 'Write a full grant application for your rescue',           prompt: (v: V) => `Write a professional grant application for ${v.orgName || 'our animal rescue'} requesting funding for: ${v.purpose || 'rescue operations'}. Include mission statement, impact metrics, budget justification, and closing ask. Amount: $${v.amount || '5,000'}.` },
  { id: 'fundraising_email', label: '💌 Fundraising Email',   desc: 'Compelling donor email that converts',                     prompt: (v: V) => `Write a compelling fundraising email for ${v.orgName || 'our animal rescue'}. Campaign: ${v.campaign || 'general operations'}. Goal: $${v.goal || '1,000'}. Make it emotional, urgent, and specific with a clear CTA.` },
  { id: 'social_media_post', label: '📱 Social Media Post',   desc: 'Attention-grabbing post for Instagram/Facebook/X',        prompt: (v: V) => `Create 3 social media posts (Instagram, Facebook, X/Twitter) for ${v.orgName || 'our rescue'} about: ${v.topic || v.animalName || 'an animal in need'}. Make each platform-specific with appropriate hashtags and emojis.` },
  { id: 'donation_appeal',   label: '🙏 Donation Appeal',     desc: 'Emergency or general donation appeal letter',              prompt: (v: V) => `Write a powerful donation appeal letter for ${v.orgName || 'our rescue'}. Situation: ${v.situation || 'animals need help urgently'}. Be specific, emotional, and include a clear donation CTA with impact per dollar.` },
  { id: 'volunteer_guide',   label: '🤝 Volunteer Guide',     desc: 'Onboarding guide and role descriptions for volunteers',   prompt: (v: V) => `Create a complete volunteer onboarding guide for ${v.orgName || 'our animal rescue'}. Include: welcome message, shelter rules, role descriptions, animal handling basics, shift scheduling info, and emergency contacts template.` },
  { id: 'care_guide',        label: '🏥 Animal Care Guide',   desc: 'Detailed care instructions for a specific animal/breed',  prompt: (v: V) => `Write a complete care guide for ${v.animalName || 'this animal'} — ${v.breed || v.species || 'mixed breed'}. Include: feeding schedule, exercise needs, grooming, vet care, behavioral notes, and special needs: ${v.specialNeeds || 'none noted'}.` },
]

type V = Record<string, string>

const FIELDS: Record<string, { label: string; fields: Array<{ id: string; label: string; placeholder: string; type?: string }> }> = {
  adoption_listing:  { label: 'Animal Details', fields: [{ id: 'animalName', label: 'Animal Name', placeholder: 'Bella' }, { id: 'breed', label: 'Breed', placeholder: 'Labrador Mix' }, { id: 'age', label: 'Age', placeholder: '2 years' }, { id: 'personality', label: 'Personality', placeholder: 'Playful, loves kids, house trained...' }] },
  grant_application: { label: 'Grant Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'purpose', label: 'Purpose of Grant', placeholder: 'Medical care for injured animals' }, { id: 'amount', label: 'Amount Requested ($)', placeholder: '5000' }] },
  fundraising_email: { label: 'Campaign Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'campaign', label: 'Campaign Name', placeholder: 'Winter Shelter Fund' }, { id: 'goal', label: 'Fundraising Goal ($)', placeholder: '2000' }] },
  social_media_post: { label: 'Post Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'topic', label: 'Post Topic', placeholder: 'Urgent adoption need for senior dog named Max' }] },
  donation_appeal:   { label: 'Appeal Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'situation', label: 'Situation', placeholder: 'Overcrowded shelter, 20 animals need homes by Friday' }] },
  volunteer_guide:   { label: 'Organization Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }] },
  care_guide:        { label: 'Animal Details', fields: [{ id: 'animalName', label: 'Animal Name / Type', placeholder: 'Senior cat, 12 years old' }, { id: 'breed', label: 'Breed / Species', placeholder: 'Domestic Shorthair' }, { id: 'specialNeeds', label: 'Special Needs', placeholder: 'Diabetes, requires insulin twice daily' }] },
}

export default function AnimalRescuePage() {
  const [action, setAction] = useState(ACTIONS[0])
  const [values, setValues] = useState<V>({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLTextAreaElement>(null)

  function setV(id: string, val: string) {
    setValues(p => ({ ...p, [id]: val }))
  }

  async function generate() {
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const prompt = action.prompt(values)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action.id, input: prompt }),
      })
      const data = await res.json() as { result?: string; error?: string }
      if (!res.ok || data.error) throw new Error(data.error || 'Generation failed')
      setOutput(data.result || '')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
    setLoading(false)
  }

  function copy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fields = FIELDS[action.id]

  return (
    <div style={{ background: '#0c0f0a', minHeight: '100vh', color: '#e8e2d4', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(12,15,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(180,160,120,0.15)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <a href="https://craudiovizai.com" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>🐾</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#d4a853', letterSpacing: '-0.02em' }}>Javari Animal Rescue</span>
        </a>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="https://javariai.com" style={{ color: '#9c8f78', fontSize: 13, textDecoration: 'none', padding: '6px 12px' }}>Javari AI</a>
          <a href="https://craudiovizai.com/auth/signup" style={{ background: 'linear-gradient(135deg, #d4a853, #a0522d)', color: '#0c0f0a', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Free Access →</a>
        </div>
      </nav>
      <div style={{ height: 60 }} />

      {/* HERO */}
      <section style={{ textAlign: 'center', padding: '56px 24px 40px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🐾</div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, margin: '0 0 16px', color: '#e8e2d4', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          AI Tools for Animal Rescues
        </h1>
        <p style={{ fontSize: 17, color: '#9c8f78', maxWidth: 520, margin: '0 auto 8px', lineHeight: 1.65, fontFamily: 'system-ui' }}>
          Write grant applications, adoption listings, fundraising emails, and more in seconds. 
          <strong style={{ color: '#d4a853' }}> Always 100% free</strong> for registered rescues.
        </p>
        <p style={{ color: '#5a5248', fontSize: 13, fontFamily: 'system-ui' }}>Powered by Javari AI · DeepSeek + Llama 3.3 · CR AudioViz AI, LLC</p>
      </section>

      {/* MAIN TOOL */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 24, alignItems: 'start' }}>
        
        {/* LEFT: Action selector + fields */}
        <div>
          <div style={{ background: '#131710', border: '1px solid rgba(180,160,120,0.1)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(180,160,120,0.08)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#6b5f4e', fontFamily: 'system-ui', textTransform: 'uppercase' }}>Choose Tool</div>
            {ACTIONS.map(a => (
              <button key={a.id} onClick={() => { setAction(a); setValues({}); setOutput('') }}
                style={{ width: '100%', textAlign: 'left', padding: '13px 18px', background: action.id === a.id ? 'rgba(212,168,83,0.12)' : 'transparent', borderLeft: action.id === a.id ? '3px solid #d4a853' : '3px solid transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(180,160,120,0.06)', display: 'block' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: action.id === a.id ? '#d4a853' : '#c8bca8', fontFamily: 'system-ui' }}>{a.label}</div>
                <div style={{ fontSize: 12, color: '#6b5f4e', marginTop: 2, fontFamily: 'system-ui' }}>{a.desc}</div>
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ background: '#131710', border: '1px solid rgba(180,160,120,0.1)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#6b5f4e', fontFamily: 'system-ui', textTransform: 'uppercase', marginBottom: 16 }}>{fields.label}</div>
            {fields.fields.map(f => (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#9c8f78', marginBottom: 6, fontFamily: 'system-ui', fontWeight: 500 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea value={values[f.id] || ''} onChange={e => setV(f.id, e.target.value)} placeholder={f.placeholder}
                    style={{ width: '100%', background: '#0c0f0a', border: '1px solid rgba(180,160,120,0.15)', borderRadius: 8, padding: '10px 14px', color: '#e8e2d4', fontSize: 13, fontFamily: 'system-ui', resize: 'vertical', minHeight: 80, boxSizing: 'border-box', outline: 'none' }} />
                ) : (
                  <input value={values[f.id] || ''} onChange={e => setV(f.id, e.target.value)} placeholder={f.placeholder}
                    style={{ width: '100%', background: '#0c0f0a', border: '1px solid rgba(180,160,120,0.15)', borderRadius: 8, padding: '10px 14px', color: '#e8e2d4', fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box', outline: 'none' }} />
                )}
              </div>
            ))}
            <button onClick={generate} disabled={loading}
              style={{ width: '100%', background: loading ? '#3a3020' : 'linear-gradient(135deg, #d4a853, #a0522d)', color: loading ? '#6b5f4e' : '#0c0f0a', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'system-ui', marginTop: 4 }}>
              {loading ? '✦ Generating...' : `✦ Generate ${action.label}`}
            </button>
            {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontFamily: 'system-ui' }}>⚠ {error}</p>}
          </div>
        </div>

        {/* RIGHT: Output */}
        <div style={{ background: '#131710', border: '1px solid rgba(180,160,120,0.1)', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 80 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(180,160,120,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: '#6b5f4e', fontFamily: 'system-ui', textTransform: 'uppercase' }}>Generated Output</span>
            {output && (
              <button onClick={copy} style={{ background: copied ? 'rgba(212,168,83,0.2)' : 'rgba(180,160,120,0.1)', border: '1px solid rgba(180,160,120,0.2)', color: copied ? '#d4a853' : '#9c8f78', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'system-ui' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>
          {output ? (
            <textarea ref={outputRef} value={output} readOnly
              style={{ width: '100%', background: 'transparent', border: 'none', padding: '20px', color: '#e8e2d4', fontSize: 14, lineHeight: 1.75, fontFamily: 'Georgia, serif', resize: 'vertical', minHeight: 480, boxSizing: 'border-box', outline: 'none' }} />
          ) : (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>{loading ? '⏳' : '🐾'}</div>
              <p style={{ color: '#5a5248', fontSize: 14, fontFamily: 'system-ui', lineHeight: 1.6 }}>
                {loading ? 'Javari AI is writing your content...' : 'Select a tool, fill in the details, and click Generate.
All tools are free for animal rescues.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* IMPACT BAR */}
      <section style={{ background: '#0d1109', borderTop: '1px solid rgba(180,160,120,0.08)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { n: '100%', l: 'Free for rescues' },
            { n: '7', l: 'AI-powered tools' },
            { n: '<5s', l: 'Generation time' },
            { n: '∞', l: 'Uses per month' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#d4a853', letterSpacing: '-0.03em' }}>{s.n}</div>
              <div style={{ fontSize: 13, color: '#6b5f4e', fontFamily: 'system-ui', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#080b07', borderTop: '1px solid rgba(180,160,120,0.06)', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: '#3d3830', fontSize: 12, fontFamily: 'system-ui', margin: '0 0 6px' }}>© 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · Fort Myers, Florida</p>
        <p style={{ color: '#2a2520', fontSize: 12, fontFamily: 'system-ui', margin: 0 }}>Your Story. Our Design. Everyone Connects. Everyone Wins.</p>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 16 }}>
          {['craudiovizai.com', 'javariai.com', 'javaritravel.com'].map(link => (
            <a key={link} href={`https://${link}`} style={{ color: '#4a4338', fontSize: 11, textDecoration: 'none', fontFamily: 'system-ui' }}>{link}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
