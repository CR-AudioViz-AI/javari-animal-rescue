'use client'
// app/rescue/register/page.tsx
// Reverted 2026-07-31: no separate plan selection or checkout. Registering
// a rescue is free and instant - directory features (listing, featured
// placement) are derived from the owning user's real existing platform
// subscription, the same one that already grants credits for every app.
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', city: '', state: '', website: '', mission: '', description: '', nonprofit: false, ein: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ slug: string } | null>(null)

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
      setDone({ slug: d.slug })
    } finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#F0F8FF', fontFamily: 'system-ui,sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#00D4FF', fontSize: 13, textDecoration: 'none' }}>← Back to tools</Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '12px 0 4px' }}>Register Your Rescue</h1>
        <p style={{ color: '#607090', fontSize: 13, marginBottom: 20 }}>
          Free to register. Your directory listing and featured placement reflect your existing
          CR AudioViz AI subscription - the same one that already gives you AI tool credits.
        </p>

        {!authToken && (
          <p style={{ color: '#F59E0B', fontSize: 13, marginBottom: 16 }}>
            Please <a href="/login" style={{ color: '#00D4FF' }}>sign in</a> first to register a rescue.
          </p>
        )}
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        {done ? (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: 20 }}>
            <p style={{ color: '#10B981', fontWeight: 700, marginBottom: 8 }}>Registered!</p>
            <Link href={`/rescue/${done.slug}`} style={{ color: '#00D4FF' }}>View your public page →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { k: 'name', l: 'Organization Name*' }, { k: 'city', l: 'City' }, { k: 'state', l: 'State' },
              { k: 'website', l: 'Website' }, { k: 'ein', l: 'EIN (if a registered nonprofit)' },
            ].map(f => (
              <input key={f.k} placeholder={f.l}
                value={form[f.k as keyof typeof form] ?? ''}
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
              {busy ? 'Registering…' : 'Register My Rescue'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
