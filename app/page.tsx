'use client'
import { useState, useRef } from 'react'
import { getActions, getFields } from '@/lib/tool-data'

export default function AnimalRescuePage() {
  const actions = getActions()
  const [actionId, setActionId] = useState(actions[0].id)
  const [values, setValues] = useState({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function setV(id, val) { setValues(p => ({ ...p, [id]: val })) }

  async function generate() {
    const action = actions.find(a => a.id === actionId)
    if (!action) return
    setLoading(true); setError(''); setOutput('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionId, input: action.buildPrompt(values) }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Generation failed')
      setOutput(data.result || '')
    } catch (e) { setError(e.message || 'Something went wrong') }
    setLoading(false)
  }

  const action = actions.find(a => a.id === actionId)
  const fields = getFields(actionId)

  return (
    <div style={{ background: '#0c0f0a', minHeight: '100vh', color: '#e8e2d4', fontFamily: 'Georgia, serif' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(12,15,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(180,160,120,0.15)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <a href="https://craudiovizai.com" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>🐾</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: '#d4a853', letterSpacing: '-0.02em' }}>Javari Animal Rescue</span>
        </a>
        <a href="https://craudiovizai.com/auth/signup" style={{ background: 'linear-gradient(135deg,#d4a853,#a0522d)', color: '#0c0f0a', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Free Access</a>
      </nav>
      <div style={{ height: 60 }} />
      <section style={{ textAlign: 'center', padding: '52px 24px 36px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🐾</div>
        <h1 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, margin: '0 0 12px', color: '#e8e2d4' }}>AI Tools for Animal Rescues</h1>
        <p style={{ fontSize: 16, color: '#9c8f78', maxWidth: 500, margin: '0 auto 6px', lineHeight: 1.65, fontFamily: 'system-ui' }}>Grant applications, adoption listings, fundraising emails, and more. <strong style={{ color: '#d4a853' }}>Always free for registered rescues.</strong></p>
        <p style={{ color: '#5a5248', fontSize: 12, fontFamily: 'system-ui' }}>Powered by Javari AI · DeepSeek + Llama 3.3</p>
      </section>
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 20 }}>
        <div>
          <div style={{ background: '#131710', border: '1px solid rgba(180,160,120,0.1)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(180,160,120,0.08)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#6b5f4e', fontFamily: 'system-ui', textTransform: 'uppercase' }}>Choose Tool</div>
            {actions.map(a => (
              <button key={a.id} onClick={() => { setActionId(a.id); setValues({}); setOutput('') }}
                style={{ width: '100%', textAlign: 'left', padding: '11px 16px', background: actionId === a.id ? 'rgba(212,168,83,0.12)' : 'transparent', borderLeft: actionId === a.id ? '3px solid #d4a853' : '3px solid transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(180,160,120,0.06)', display: 'block' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: actionId === a.id ? '#d4a853' : '#c8bca8', fontFamily: 'system-ui' }}>{a.label}</div>
                <div style={{ fontSize: 11, color: '#6b5f4e', marginTop: 2, fontFamily: 'system-ui' }}>{a.desc}</div>
              </button>
            ))}
          </div>
          <div style={{ background: '#131710', border: '1px solid rgba(180,160,120,0.1)', borderRadius: 14, padding: '16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#6b5f4e', fontFamily: 'system-ui', textTransform: 'uppercase', marginBottom: 14 }}>{fields.label || 'Details'}</div>
            {(fields.fields || []).map(f => (
              <div key={f.id} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9c8f78', marginBottom: 5, fontFamily: 'system-ui', fontWeight: 500 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea value={values[f.id] || ''} onChange={e => setV(f.id, e.target.value)} placeholder={f.placeholder} rows={3}
                    style={{ width: '100%', background: '#0c0f0a', border: '1px solid rgba(180,160,120,0.15)', borderRadius: 8, padding: '9px 12px', color: '#e8e2d4', fontSize: 13, fontFamily: 'system-ui', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                ) : (
                  <input value={values[f.id] || ''} onChange={e => setV(f.id, e.target.value)} placeholder={f.placeholder}
                    style={{ width: '100%', background: '#0c0f0a', border: '1px solid rgba(180,160,120,0.15)', borderRadius: 8, padding: '9px 12px', color: '#e8e2d4', fontSize: 13, fontFamily: 'system-ui', boxSizing: 'border-box', outline: 'none' }} />
                )}
              </div>
            ))}
            <button onClick={generate} disabled={loading}
              style={{ width: '100%', background: loading ? '#3a3020' : 'linear-gradient(135deg,#d4a853,#a0522d)', color: loading ? '#6b5f4e' : '#0c0f0a', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'system-ui', marginTop: 4 }}>
              {loading ? 'Generating...' : 'Generate ' + (action ? action.label : '')}
            </button>
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8, fontFamily: 'system-ui' }}>⚠ {error}</p>}
          </div>
        </div>
        <div style={{ background: '#131710', border: '1px solid rgba(180,160,120,0.1)', borderRadius: 14, overflow: 'hidden', position: 'sticky', top: 80, alignSelf: 'start' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(180,160,120,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#6b5f4e', fontFamily: 'system-ui', textTransform: 'uppercase' }}>Generated Output</span>
            {output && (
              <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                style={{ background: copied ? 'rgba(212,168,83,0.2)' : 'rgba(180,160,120,0.1)', border: '1px solid rgba(180,160,120,0.2)', color: copied ? '#d4a853' : '#9c8f78', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'system-ui' }}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          {output ? (
            <textarea value={output} readOnly style={{ width: '100%', background: 'transparent', border: 'none', padding: '18px', color: '#e8e2d4', fontSize: 14, lineHeight: 1.75, resize: 'vertical', minHeight: 460, boxSizing: 'border-box', outline: 'none', fontFamily: 'Georgia, serif' }} />
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{loading ? '⏳' : '🐾'}</div>
              <p style={{ color: '#3d3830', fontSize: 13, fontFamily: 'system-ui', lineHeight: 1.6 }}>
                {loading ? 'Writing your content...' : 'Select a tool, fill in details, and click Generate.\nFree for registered rescues.'}
              </p>
            </div>
          )}
        </div>
      </section>
      <footer style={{ background: '#080b07', borderTop: '1px solid rgba(180,160,120,0.06)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#1a1510', fontSize: 11, fontFamily: 'system-ui', margin: 0 }}>© 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · Fort Myers, Florida · Your Story. Our Design. Everyone Connects. Everyone Wins.</p>
      </footer>
    </div>
  )
}
