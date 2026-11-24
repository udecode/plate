import * as React from 'react';

import {
  getPlateCreatePreset,
  readPlateCreateConfig,
} from '@/lib/plate-create';
import { getCachedPlateCreateTheme } from '@/lib/plate-create-theme';

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
  const config = readPlateCreateConfig(await searchParams);
  const preset = getPlateCreatePreset(config);
  const theme = await getCachedPlateCreateTheme(config.base, preset).catch(
    () => null
  );

  return (
    <CreatePreview
      initialConfig={config}
      initialTheme={theme && { ...theme, preset }}
    />
  );
}
