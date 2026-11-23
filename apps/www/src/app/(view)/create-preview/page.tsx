import * as React from 'react';

import {
  getPlateCreatePreset,
  readPlateCreateConfig,
} from '@/lib/plate-create';
import { getPlateCreateTheme } from '@/lib/plate-create-theme';

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
  const preset = getPlateCreatePreset(config);
  const theme = await getPlateCreateTheme(config.base, preset).catch(
    () => null
  );

  return (
    <CreatePreview
      initialConfig={config}
      initialTheme={theme && { ...theme, preset }}
    />
  );
}
