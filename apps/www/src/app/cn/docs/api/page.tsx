import React, { Suspense } from 'react';

import type { Metadata } from 'next';

import { NavItemsGrid } from '@/app/(app)/docs/[[...slug]]/nav-items-grid';

const title = 'API';
const description = '浏览所有 Plate API。';

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

export default function CNApiPage() {
  return (
    <Suspense fallback={null}>
      <NavItemsGrid category="api" showFilter={false} />
    </Suspense>
  );
}
