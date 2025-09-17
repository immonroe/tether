import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import { ErrorProvider } from '@/components/providers/ErrorProvider'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tether - AI-Powered Learning Platform',
  description: 'An innovative AI-powered learning platform that combines personalized tutoring, mastery learning, spaced repetition, and AI-facilitated study groups.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ErrorProvider>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </ErrorProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
