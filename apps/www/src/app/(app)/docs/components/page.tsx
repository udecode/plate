import React from 'react';

import type { Metadata } from 'next';

import { NavItemsGrid } from '@/app/(app)/docs/[[...slug]]/nav-items-grid';

const title = 'Components';
const description = 'Browse all Plate components.';

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

export default function ComponentsPage() {
  return <NavItemsGrid category="component" />;
}
