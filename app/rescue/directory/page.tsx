'use client'
// app/rescue/directory/page.tsx
// Real directory of registered, verified rescues - the "connect with each
// other" feature. Pulls from the real /api/rescues endpoint, nothing
// hardcoded or fabricated.
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Rescue = { id: string; name: string; slug: string; city: string; state: string
  description: string | null; logo_url: string | null; featured: boolean; verified: boolean }

export default function DirectoryPage() {
  const [rescues, setRescues] = useState<Rescue[]>([])
  const [loading, setLoading] = useState(true)
  const [disclosure, setDisclosure] = useState<string | null>(null)
  const [stateFilter, setStateFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    const url = stateFilter ? `/api/rescues?state=${encodeURIComponent(stateFilter)}` : '/api/rescues'
    fetch(url).then(r => r.json()).then(d => {
      setRescues(d.rescues ?? [])
      setDisclosure(d.disclosure ?? null)
    }).finally(() => setLoading(false))
  }, [stateFilter])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#F0F8FF', fontFamily: 'system-ui,sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Link href="/" style={{ color: '#00D4FF', fontSize: 13, textDecoration: 'none' }}>← Back to tools</Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '12px 0 4px' }}>Rescue Directory</h1>
        <p style={{ color: '#607090', fontSize: 13, marginBottom: 16 }}>
          Verified, registered rescue organizations nationwide.
        </p>

        <input
          placeholder="Filter by state (e.g. FL)"
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          style={{ width: '100%', maxWidth: 240, padding: 10, borderRadius: 8, marginBottom: 20,
            background: 'rgba(16,28,52,0.9)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F8FF' }}
        />

        {disclosure && (
          <p style={{ fontSize: 11, color: '#607090', marginBottom: 16 }}>{disclosure}</p>
        )}

        {loading ? (
          <p style={{ color: '#607090' }}>Loading…</p>
        ) : rescues.length === 0 ? (
          <p style={{ color: '#607090' }}>No verified rescues listed yet - be the first to register.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {rescues.map(r => (
              <Link key={r.id} href={`/rescue/${r.slug}`} style={{
                display: 'flex', gap: 14, padding: 16, background: 'rgba(16,28,52,0.9)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, textDecoration: 'none', color: '#F0F8FF' }}>
                {r.logo_url ? (
                  <img src={r.logo_url} alt={r.name} width={48} height={48} style={{ borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg,#00D4FF,#10B981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🐾</div>
                )}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    {r.name} {r.verified && '✅'}
                    {r.featured && (
                      <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 999,
                        background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>Featured</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#607090' }}>{r.city}, {r.state}</div>
                  {r.description && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{r.description.slice(0, 100)}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
