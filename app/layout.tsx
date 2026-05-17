// app/layout.tsx — Javari Animal Rescue
// Fortune 50 quality — uses AppShell for full ecosystem integration
// May 17, 2026 — CR AudioViz AI, LLC
import type { Metadata } from 'next'
import './globals.css'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Javari Animal Rescue | Javari by CR AudioViz AI',
  description: 'Animal rescue and adoption support — always free',
  keywords: 'Javari Animal Rescue, Javari, AI, CR AudioViz AI',
}

import AppShell from '@/components/AppShell'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AppShell
          appName="Javari Animal Rescue"
          appColor="#10b981"
          appEmoji="🐾"
          appDesc="Animal rescue and adoption support — always free"
        >
          {children}
        </AppShell>
      </body>
    </html>
  )
}
