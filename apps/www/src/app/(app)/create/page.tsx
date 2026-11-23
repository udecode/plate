import type { Metadata } from 'next';
import * as React from 'react';

import { readPlateCreateConfig } from '@/lib/plate-create';

import { CreateClient } from './create-client';

export const metadata: Metadata = {
  title: 'Create a Plate editor',
  description:
    'Create a Plate editor with your preferred shadcn style and primitives.',
};

export default function CreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <React.Suspense fallback={null}>
      <CreateContent searchParams={searchParams} />
    </React.Suspense>
  );
}

async function CreateContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <CreateClient initialConfig={readPlateCreateConfig(await searchParams)} />
  );
}
