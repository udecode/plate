import React from 'react';

import type { Metadata } from 'next';

import { NavItemsGrid } from '@/app/(app)/docs/[[...slug]]/nav-items-grid';

const title = 'Plugins';
const description = 'Browse all Plate plugins.';

export const metadata: Metadata = {
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  title,
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export default function PluginsPage() {
  return <NavItemsGrid category="plugin" />;
}
