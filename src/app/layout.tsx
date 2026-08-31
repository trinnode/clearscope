import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { DataProvider } from '@/data/provider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CLEARSCOPE — Today Proof Aligns With Bold Scope',
  description:
    'Compliance proofs without disclosure. Prove eligibility without revealing underlying data.',
}

const themeScript = `(function(){
  try {
    var t = localStorage.getItem('clearscope-theme');
    if (t === 'light') document.documentElement.classList.add('light');
  } catch (e) {}
})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://db.onlinewebfonts.com/c/4556933d6966c60eda45bebad34d9c90?family=Flexo+Soft+Medium"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  )
}
