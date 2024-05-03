import React from 'react';

import type { Metadata, Viewport } from 'next';

import { cn } from '@udecode/cn';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createPlateEditor } from '@udecode/plate-common/server';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createListPlugin } from '@udecode/plate-list';
import { createImagePlugin } from '@udecode/plate-media';
import { createParagraphPlugin } from '@udecode/plate-paragraph';

import { Analytics } from '@/components/analytics';
import { Body } from '@/components/body';
import { Providers } from '@/components/context/providers';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { TailwindIndicator } from '@/components/tailwind-indicator';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/config/site';
import { fontSans } from '@/lib/fonts';

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
    shortcut: '/favicon-16x16.png',
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
  themeColor: [
    { color: 'white', media: '(prefers-color-scheme: light)' },
    { color: 'black', media: '(prefers-color-scheme: dark)' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const editor = createPlateEditor({
    plugins: [
      createHeadingPlugin(),
      createCodeBlockPlugin(),
      createParagraphPlugin(),
      createListPlugin(),
      createImagePlugin(),

      // "@udecode/plate-basic-marks": "32.0.0",
      // "@udecode/plate-block-quote": "32.0.0",
      // "@udecode/plate-code-block": "32.0.0",
      // "@udecode/plate-heading": "32.0.0",
      // "@udecode/plate-horizontal-rule": "32.0.0",
      // "@udecode/plate-link": "32.0.0",
      // "@udecode/plate-list": "32.0.0",
      // "@udecode/plate-media": "32.0.0",
    ],
  });
  editor.children = [
    {
      children: [
        {
          text: '## Hello, World!',
        },
      ],
      type: 'p',
    },
  ];
  // serializeMd(editor, { nodes: editor.children });

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <Body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          '[&_.slate-selected]:!bg-primary/20 [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10',
          fontSans.variable
        )}
        defaultTheme="slate"
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
