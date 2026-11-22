import * as React from 'react';

import { readPlateCreateConfig } from '@/lib/plate-create';

import { CreatePreview } from './create-preview';

export default function CreatePreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <React.Suspense fallback={null}>
      <CreatePreviewContent searchParams={searchParams} />
    </React.Suspense>
  );
}

async function CreatePreviewContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const read = (name: string) => {
    const value = params[name];

    return typeof value === 'string' ? value : null;
  };
  const config = readPlateCreateConfig({
    base: read('base'),
    editor: read('editor'),
    preset: read('preset'),
  });

  return (
    <CreatePreview
      base={config.base}
      editor={config.editor}
      style={config.style}
    />
  );
}
