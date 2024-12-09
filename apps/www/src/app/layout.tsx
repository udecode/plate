import React from 'react';

import type { Metadata, Viewport } from 'next';

import { cn } from '@udecode/cn';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { GA } from '@/components/analytics/ga';
import { Providers } from '@/components/context/providers';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { Toaster } from '@/components/ui/sonner';
import { META_THEME_COLORS, siteConfig } from '@/config/site';
import { fontMono, fontSans } from '@/lib/fonts';

import '@/styles/globals.css';

export const metadata: Metadata = {
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.links.github,
    },
  ],
  creator: siteConfig.author,
  description: siteConfig.description,
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/favicon.ico',
    shortcut: '/favicon-48x48.png',
  },
  keywords: [
    'Plate',
    'Slate',
    'editor',
    'wysiwyg',
    'Tailwind CSS',
    'Radix UI',
    'shadcn/ui',
    'React',
    'Next.js',
  ],
  manifest: `${siteConfig.url}/site.webmanifest`,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    description: siteConfig.description,
    images: [
      {
        alt: siteConfig.name,
        height: 630,
        url: siteConfig.ogImage,
        width: 1200,
      },
    ],
    locale: 'en_US',
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: 'website',
    url: siteConfig.url,
  },
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@zbeyens',
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    title: siteConfig.name,
  },
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <Providers>
            <div vaul-drawer-wrapper="">
              <div className="relative flex min-h-screen flex-col bg-background">
                {children}
              </div>
            </div>
          </Providers>
        </NuqsAdapter>

        <TailwindIndicator />

        <GA />
        <Toaster />
      </body>
    </html>
  );
}
