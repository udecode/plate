import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { SiteRegistryProvider } from '@/components/site-registry/provider';

import DiscussionProof from './discussion-proof';

export default function DiscussionProofPage({
  searchParams,
}: {
  searchParams: Promise<{ base?: string }>;
}) {
  if (process.env.NODE_ENV !== 'development') notFound();

  return (
    <Suspense fallback={null}>
      <DiscussionProofContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DiscussionProofContent({
  searchParams,
}: {
  searchParams: Promise<{ base?: string }>;
}) {
  const { base } = await searchParams;

  return (
    <SiteRegistryProvider base={base === 'base' ? 'base' : 'radix'}>
      <DiscussionProof />
    </SiteRegistryProvider>
  );
}
