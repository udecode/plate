import { Suspense } from 'react';

import type { Metadata } from 'next';

import { EditorDescription } from './editor-description';

// SYNC

const title = 'Building Editors for the Web';
const description =
  'Clean, modern building editors. Copy and paste into your apps. Works with all React frameworks.';

export const metadata: Metadata = {
  description,
  openGraph: {
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
  title,
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: `/og?title=${encodeURIComponent(
          title
        )}&description=${encodeURIComponent(description)}`,
      },
    ],
  },
};

export default function BlocksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative container">
      <Suspense fallback={null}>
        <EditorDescription />
      </Suspense>
      <section id="blocks" className="scroll-mt-24">
        {children}
      </section>
    </div>
  );
}
