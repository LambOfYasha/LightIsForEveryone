import type { Metadata } from 'next'
import '../globals.css'
import '../themes.css'

export const metadata: Metadata = {
  title: 'Light Is For Everyone',
  description: 'Ask questions, get answers, and grow spiritually together',
}

export default function BareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  )
}
