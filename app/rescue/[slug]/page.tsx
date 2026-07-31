'use client'
// app/rescue/[slug]/page.tsx
// A rescue's own public page, rendered from their real profile data - the
// actual "set up their own website" feature. Uses the rich dog_rescues
// schema (logo, cover image, mission, social links) that already existed but
// had nothing rendering it anywhere.
// CR AudioViz AI · EIN 39-3646201 · July 31, 2026
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type Rescue = {
  name: string; city: string; state: string; website: string | null
  description: string | null; mission: string | null; logo_url: string | null
  cover_url: string | null; social_facebook: string | null; social_instagram: string | null
  social_tiktok: string | null; animals_served: string[] | null; nonprofit: boolean
  verified: boolean
}

export default function RescueProfilePage() {
  const params = useParams<{ slug: string }>()
  const [rescue, setRescue] = useState<Rescue | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/rescues?slug=${encodeURIComponent(params.slug)}`)
      .then(r => r.json())
      .then(d => { if (d.rescue) setRescue(d.rescue); else setNotFound(true) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [params.slug])

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#607090' }}>Loading…</div>
  }
  if (notFound || !rescue) {
    return <div style={{ minHeight: '100vh', background: '#0a0f1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#607090' }}>Rescue not found.</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#F0F8FF', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ height: 220, background: rescue.cover_url ? `url(${rescue.cover_url}) center/cover` : 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(16,185,129,0.15))' }} />
      <div style={{ maxWidth: 800, margin: '-50px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
          {rescue.logo_url ? (
            <img src={rescue.logo_url} alt={rescue.name} width={96} height={96}
              style={{ borderRadius: 16, border: '3px solid #0a0f1a', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: 16, border: '3px solid #0a0f1a',
              background: 'linear-gradient(135deg,#00D4FF,#10B981)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🐾</div>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>
              {rescue.name} {rescue.verified && <span title="Verified rescue" style={{ fontSize: 16 }}>✅</span>}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#607090', fontSize: 14 }}>
              {rescue.city}, {rescue.state} {rescue.nonprofit && '· 501(c)(3) Nonprofit'}
            </p>
          </div>
        </div>

        {rescue.mission && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12, padding: 18, marginBottom: 20 }}>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#10B981' }}>{rescue.mission}</p>
          </div>
        )}

        {rescue.description && (
          <p style={{ lineHeight: 1.7, color: '#dbeafe', marginBottom: 24 }}>{rescue.description}</p>
        )}

        {rescue.animals_served && rescue.animals_served.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: 'uppercase', color: '#607090', marginBottom: 8 }}>Animals We Serve</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rescue.animals_served.map(a => (
                <span key={a} style={{ background: 'rgba(0,212,255,0.1)', padding: '4px 12px',
                  borderRadius: 999, fontSize: 13 }}>{a}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
          {rescue.website && (
            <a href={rescue.website} target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#00D4FF,#10B981)',
                color: '#000', fontWeight: 700, borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>
              Visit Website
            </a>
          )}
          {rescue.social_facebook && <a href={rescue.social_facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#00D4FF' }}>Facebook</a>}
          {rescue.social_instagram && <a href={rescue.social_instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#00D4FF' }}>Instagram</a>}
          {rescue.social_tiktok && <a href={rescue.social_tiktok} target="_blank" rel="noopener noreferrer" style={{ color: '#00D4FF' }}>TikTok</a>}
        </div>

        <p style={{ fontSize: 11, color: '#374151', textAlign: 'center' }}>
          Powered by <a href="https://javarirescue.com" style={{ color: '#00D4FF' }}>Javari Animal Rescue</a> · CR AudioViz AI
        </p>
      </div>
    </div>
  )
}
