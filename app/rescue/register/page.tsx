'use client'
// app/rescue/register/page.tsx
// Real registration flow: sign in, submit org info, pick a real paid plan,
// go to real Stripe checkout. No free tier here - matches Roy's direction
// that none of this is free.
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const PLANS = [
  { id: 'starter', name: 'Starter', price: 19, credits: 50, desc: 'Directory listing, your own page, 50 monthly AI credits.' },
  { id: 'growth', name: 'Growth', price: 49, credits: 200, desc: 'Featured placement, 200 monthly AI credits.' },
  { id: 'network', name: 'Network', price: 99, credits: 500, desc: 'Priority placement, 500 monthly AI credits - for larger or multi-location rescues.' },
]

export default function RegisterPage() {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', city: '', state: '', website: '', mission: '', description: '', nonprofit: false, ein: '' })
  const [plan, setPlan] = useState('starter')
  const [rescueId, setRescueId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'plan'>('form')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthToken(data.session?.access_token ?? null))
  }, [])

  const submitOrg = async () => {
    if (!authToken) { setError('Please log in first.'); return }
    if (!form.name.trim()) { setError('Organization name is required.'); return }
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/rescues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error ?? 'Could not register your rescue.'); return }
      setRescueId(d.id)
      setStep('plan')
    } finally { setBusy(false) }
  }

  const checkout = async () => {
    if (!authToken || !rescueId) return
    setBusy(true); setError(null)
    try {
      // Fixed 2026-07-31: this used to call a local, duplicate Stripe
      // integration built by mistake. Now calls a thin local proxy (no
      // Stripe logic of its own) which forwards server-side to the ONE
      // central payments endpoint every app uses - a direct browser call
      // to craudiovizai.com would fail CORS, so the forward happens
      // server-to-server instead.
      const res = await fetch('/api/rescues/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          mode: 'rescue_plan',
          rescueId,
          rescuePlan: plan,
          successUrl: `${window.location.origin}/rescue/manage?checkout=success`,
          cancelUrl: `${window.location.origin}/rescue/manage?checkout=canceled`,
        }),
      })
      const d = await res.json()
      if (d.url) window.location.href = d.url
      else setError(d.error ?? 'Could not start checkout.')
    } finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#F0F8FF', fontFamily: 'system-ui,sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#00D4FF', fontSize: 13, textDecoration: 'none' }}>← Back to tools</Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '12px 0 4px' }}>Register Your Rescue</h1>
        <p style={{ color: '#607090', fontSize: 13, marginBottom: 20 }}>
          Get your own public page, a directory listing, and monthly AI tool credits.
        </p>

        {!authToken && (
          <p style={{ color: '#F59E0B', fontSize: 13, marginBottom: 16 }}>
            Please <a href="/login" style={{ color: '#00D4FF' }}>sign in</a> first to register a rescue.
          </p>
        )}

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        {step === 'form' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { k: 'name', l: 'Organization Name*' }, { k: 'city', l: 'City' }, { k: 'state', l: 'State' },
              { k: 'website', l: 'Website' }, { k: 'ein', l: 'EIN (if a registered nonprofit)' },
            ].map(f => (
              <input key={f.k} placeholder={f.l}
                value={(form as Record<string, string>)[f.k]}
                onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                style={{ padding: 10, borderRadius: 8, background: 'rgba(16,28,52,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#F0F8FF' }} />
            ))}
            <textarea placeholder="Mission statement" value={form.mission}
              onChange={e => setForm({ ...form, mission: e.target.value })}
              style={{ padding: 10, borderRadius: 8, background: 'rgba(16,28,52,0.9)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#F0F8FF', minHeight: 60 }} />
            <textarea placeholder="Description of your rescue" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ padding: 10, borderRadius: 8, background: 'rgba(16,28,52,0.9)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#F0F8FF', minHeight: 60 }} />
            <button onClick={submitOrg} disabled={busy || !authToken}
              style={{ padding: '12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#00D4FF,#10B981)',
                color: '#000', fontWeight: 800, cursor: 'pointer', opacity: busy || !authToken ? 0.5 : 1 }}>
              {busy ? 'Submitting…' : 'Continue to Plan Selection'}
            </button>
          </div>
        )}

        {step === 'plan' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {PLANS.map(p => (
              <label key={p.id} style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 10,
                background: plan === p.id ? 'rgba(0,212,255,0.1)' : 'rgba(16,28,52,0.9)',
                border: plan === p.id ? '1px solid #00D4FF' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                <input type="radio" checked={plan === p.id} onChange={() => setPlan(p.id)} style={{ marginTop: 4 }} />
                <div>
                  <div style={{ fontWeight: 800 }}>{p.name} — ${p.price}/mo</div>
                  <div style={{ fontSize: 12, color: '#607090' }}>{p.desc}</div>
                </div>
              </label>
            ))}
            <button onClick={checkout} disabled={busy}
              style={{ padding: '12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#00D4FF,#10B981)',
                color: '#000', fontWeight: 800, cursor: 'pointer', opacity: busy ? 0.5 : 1 }}>
              {busy ? 'Redirecting…' : 'Continue to Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
