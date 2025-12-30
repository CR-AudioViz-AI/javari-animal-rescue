import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Animal Rescue Hub | CR AudioViz AI',
  description: 'Connecting shelters, rescues, and forever homes. Free tools for animal welfare organizations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
