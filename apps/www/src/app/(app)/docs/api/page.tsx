import React, { Suspense } from 'react';

import type { Metadata } from 'next';

import { NavItemsGrid } from '@/app/(app)/docs/[[...slug]]/nav-items-grid';
import { getDocsRootLinks } from '@/lib/docs-page-tree';

const title = 'API';
const description = 'Browse all Plate APIs.';

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

export default function ApiPage() {
  return (
    <Suspense fallback={null}>
      <NavItemsGrid
        category="api"
        roots={getDocsRootLinks('api')}
        showFilter={false}
      />
    </Suspense>
  );
}
