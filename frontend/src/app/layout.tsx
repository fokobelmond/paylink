import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import { PwaRegistration } from '@/components/ui/PwaRegistration'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'PayLink - Recevez des paiements Mobile Money facilement',
    template: '%s | PayLink',
  },
  description:
    'Créez votre page de paiement en quelques minutes et recevez des paiements via Orange Money et MTN MoMo au Cameroun.',
  keywords: [
    'paiement mobile',
    'Orange Money',
    'MTN MoMo',
    'Cameroun',
    'freelance',
    'paiement en ligne',
    'mobile money',
  ],
  authors: [{ name: 'PayLink' }],
  creator: 'PayLink',
  publisher: 'PayLink',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_CM',
    url: 'https://paylink.cm',
    siteName: 'PayLink',
    title: 'PayLink - Recevez des paiements Mobile Money facilement',
    description:
      'Créez votre page de paiement en quelques minutes et recevez des paiements via Orange Money et MTN MoMo.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PayLink',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayLink - Paiements Mobile Money',
    description: 'Recevez des paiements facilement au Cameroun',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PayLink" />
      </head>
      <body className="min-h-screen bg-slate-50">
        <PwaRegistration />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '10px',
            },
          }}
        />
      </body>
    </html>
  )
}


