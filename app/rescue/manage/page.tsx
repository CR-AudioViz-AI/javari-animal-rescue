'use client'
// app/rescue/manage/page.tsx
// Where checkout success/cancel actually lands. Shows real plan status
// pulled from the database, not a static "thank you" page disconnected
// from whether payment actually went through.
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ManagePage() {
  const params = useSearchParams()
  const checkoutResult = params.get('checkout')
  const [rescue, setRescue] = useState<{ name: string; plan: string; plan_status: string; slug: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) { setLoading(false); return }
      // Real status check - not assumed from the checkout redirect alone,
      // since a webhook race could mean the DB hasn't updated the instant
      // Stripe redirects back.
      const res = await fetch('/api/rescues/mine', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { const d = await res.json(); setRescue(d.rescue ?? null) }
      setLoading(false)
    })()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#F0F8FF', fontFamily: 'system-ui,sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        {checkoutResult === 'success' && (
          <p style={{ color: '#10B981', marginBottom: 16 }}>Payment received — activating your plan now.</p>
        )}
        {checkoutResult === 'canceled' && (
          <p style={{ color: '#F59E0B', marginBottom: 16 }}>Checkout was canceled — no charge was made.</p>
        )}

        {loading ? (
          <p style={{ color: '#607090' }}>Checking your rescue's status…</p>
        ) : rescue ? (
          <div style={{ background: 'rgba(16,28,52,0.9)', borderRadius: 12, padding: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{rescue.name}</h1>
            <p style={{ fontSize: 13, color: '#607090' }}>
              Plan: <strong style={{ color: '#F0F8FF' }}>{rescue.plan}</strong> ·
              Status: <strong style={{ color: rescue.plan_status === 'active' ? '#10B981' : '#F59E0B' }}>{rescue.plan_status}</strong>
            </p>
            {rescue.plan_status !== 'active' && (
              <p style={{ fontSize: 12, color: '#607090', marginTop: 8 }}>
                If you just paid, this can take a few seconds to update — refresh shortly.
              </p>
            )}
            <Link href={`/rescue/${rescue.slug}`} style={{ display: 'inline-block', marginTop: 16, color: '#00D4FF' }}>
              View your public page →
            </Link>
          </div>
        ) : (
          <p style={{ color: '#607090' }}>
            No rescue found for your account. <Link href="/rescue/register" style={{ color: '#00D4FF' }}>Register one</Link>.
          </p>
        )}
      </div>
    </div>
  )
}
