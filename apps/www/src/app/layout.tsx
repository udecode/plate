import '@/styles/globals.css';

import React from 'react';
import { Metadata, Viewport } from 'next';
import { cn } from '@udecode/cn';
import { createPlateEditor } from '@udecode/plate-common/server';
import { createHeadingPlugin } from '@udecode/plate-heading';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/lib/fonts';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@/components/analytics';
import { Body } from '@/components/body';
import { Providers } from '@/components/context/providers';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { TailwindIndicator } from '@/components/tailwind-indicator';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
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
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.links.github,
    },
  ],
  creator: siteConfig.author,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@zbeyens',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const editor = createPlateEditor({
    plugins: [createHeadingPlugin()],
  });
  editor.children = [
    {
      type: 'p',
      children: [
        {
          text: '## Hello, World!',
        },
      ],
    },
  ];
  // serializeMd(editor, { nodes: editor.children });

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <Body
        defaultTheme="slate"
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          '[&_.slate-selected]:!bg-primary/20 [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10',
          fontSans.variable
        )}
        suppressHydrationWarning
      >
        <Providers>
          <div vaul-drawer-wrapper="">
            <div className="relative flex min-h-screen flex-col bg-background">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </div>
        </Providers>
        <TailwindIndicator />
        <Analytics />

        <Toaster />
      </Body>
    </html>
  );
}
