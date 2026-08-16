// app/layout.tsx — javari-animal-rescue
// Universal brand shell — EIN, metadata
// CR AudioViz AI · EIN 39-3646201 · May 2026
//
// Fixed 2026-07-31 per Roy: this had its own separate, hardcoded "Sign Up
// Free" bar linking to a broken /auth/signup path - a second, competing
// sign-up prompt sitting above the real AuthButtons component in page.tsx.
// Every app has ONE auth entry point, not two - removed entirely here.
import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  metadataBase: new URL('https://animal-rescue.craudiovizai.com'),
  // 2026-08-16: no canonical was declared, so any duplicate path —
  // trailing slash, query string, preview host — competed with itself.
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/favicon.png', sizes: '32x32' }, { url: '/icon-512.png', sizes: '512x512' }],
    apple: '/apple-touch-icon.png',
  },

  title: 'Javari Animal Rescue',
  description: 'Javari Animal Rescue — powered by Javari AI on the CR AudioViz AI platform',
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  openGraph: { images: [{ url: '/og-image.png', width: 1200, height: 630 }], title: 'Javari Animal Rescue', type: 'website' },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui,sans-serif' }}>
        {children}
        <footer style={{ background: '#050609', borderTop: '1px solid rgba(255,255,255,0.04)', padding: '16px 20px', textAlign: 'center' }}>
          <p style={{ color: '#1f2937', fontSize: 11, margin: 0 }}>
            © 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · Fort Myers, Florida ·{' '}
            <a href="https://craudiovizai.com" style={{ color: '#d4a853', textDecoration: 'none' }}>craudiovizai.com</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
