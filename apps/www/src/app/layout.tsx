import React from 'react';

import { Agentation } from 'agentation';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { GA } from '@/components/analytics/ga';
import { Providers } from '@/components/context/providers';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { Toaster } from '@/components/ui/sonner';
import { META_THEME_COLORS, siteConfig } from '@/config/site';
import { fontMono, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

import '@/app/globals.css';

const isSlateMode = process.env.PLATE_WWW_SLATE === '1';

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
  alternates: {
    types: {
      'application/rss+xml': `${siteConfig.url}/rss.xml`,
    },
  },
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

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-color-script"
          strategy="beforeInteractive"
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
        <meta name="theme-color" content={META_THEME_COLORS.light} />
      </head>
      <body
        className={cn(
          'group/body min-h-svh bg-background font-sans antialiased',
          '[--footer-height:calc(var(--spacing)*14)] [--header-height:calc(var(--spacing)*14)] lg:[--header-height:calc(var(--spacing)*16)] xl:[--footer-height:calc(var(--spacing)*24)]',
          fontSans.variable,
          fontMono.variable
        )}
        suppressHydrationWarning
      >
        <NuqsAdapter>
          <Providers>
            <div className="relative flex min-h-svh flex-col bg-background">
              {children}
            </div>
          </Providers>
        </NuqsAdapter>

        {process.env.NODE_ENV === 'development' && !isSlateMode && (
          <Agentation />
        )}
        {!isSlateMode && <TailwindIndicator />}

        {!isSlateMode && <GA />}
        {!isSlateMode && <Toaster />}
      </body>
    </html>
  );
}
