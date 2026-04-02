import type { Doc } from '@/.contentlayer/generated';

import type { Metadata } from 'next';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import HugeDocumentDemo from '@/registry/examples/huge-document-demo';

const title = 'Huge Document';
const description =
  'Slate huge-document controls with isolated Plate and Slate panes.';

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

export default function HugeDocumentPage() {
  const mockDoc: Partial<Doc> = {
    description,
    slug: '/docs/examples/huge-document',
    title,
  };

  return (
    <DocContent category="example" doc={mockDoc} toc={[]}>
      <HugeDocumentDemo />
    </DocContent>
  );
}
