import * as React from 'react';

import {
  isPlateCreateBase,
  isPlateCreateEditor,
  isPlateCreateStyle,
  PLATE_DEFAULT_CREATE_EDITOR,
  PLATE_DEFAULT_CREATE_STYLE,
} from '@/lib/plate-create';
import { PLATE_DEFAULT_REGISTRY_BASE } from '@/lib/plate-registry-styles';

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
  const requestedBase = typeof params.base === 'string' ? params.base : '';
  const requestedEditor =
    typeof params.editor === 'string' ? params.editor : '';
  const requestedStyle = typeof params.style === 'string' ? params.style : '';

  return (
    <CreatePreview
      base={
        isPlateCreateBase(requestedBase)
          ? requestedBase
          : PLATE_DEFAULT_REGISTRY_BASE
      }
      editor={
        isPlateCreateEditor(requestedEditor)
          ? requestedEditor
          : PLATE_DEFAULT_CREATE_EDITOR
      }
      style={
        isPlateCreateStyle(requestedStyle)
          ? requestedStyle
          : PLATE_DEFAULT_CREATE_STYLE
      }
    />
  );
}
