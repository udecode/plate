import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import DiscussionProof from './discussion-proof';

export default function DiscussionProofPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <Suspense fallback={null}>
      <DiscussionProof />
    </Suspense>
  );
}
