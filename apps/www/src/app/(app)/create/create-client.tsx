'use client';

/* oxlint-disable react/iframe-missing-sandbox -- Next hydration reads document.cookie before app code; the preview renders trusted registry source and a scripts-only sandbox crashes hydration. */

import * as React from 'react';

import {
  createPlateCreateConfig,
  getPlateCreatePath,
  getPlateCreatePreset,
  getPlateCreatePreviewPath,
  type PlateCreateConfig,
} from '@/lib/plate-create';

import { type CreatePatch, Customizer } from './customizer';

const HOVER_SETTLE_MS = 50;

function postConfig(
  frame: HTMLIFrameElement | null,
  config: PlateCreateConfig
) {
  frame?.contentWindow?.postMessage(
    {
      base: config.base,
      editor: config.editor,
      preset: getPlateCreatePreset(config),
      rtl: config.rtl,
      type: 'plate-create-config',
    },
    window.location.origin
  );
}

export function CreateClient({
  initialConfig,
}: {
  initialConfig: PlateCreateConfig;
}) {
  const [config, setConfig] = React.useState(initialConfig);
  const [override, setOverride] = React.useState<CreatePatch | null>(null);
  const [pickedMenuAccent, setPickedMenuAccent] = React.useState(
    initialConfig.menuAccent
  );
  const [previewUrl] = React.useState(() =>
    getPlateCreatePreviewPath(initialConfig)
  );
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const previewTimer = React.useRef<number | undefined>(undefined);
  const shown = React.useMemo(
    () =>
      override
        ? createPlateCreateConfig({
            ...config,
            menuAccent: pickedMenuAccent,
            ...override,
          })
        : config,
    [config, override, pickedMenuAccent]
  );

  React.useEffect(() => {
    postConfig(frameRef.current, shown);

    const onMessage = (event: MessageEvent) => {
      if (
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === 'plate-create-ready'
      ) {
        postConfig(frameRef.current, shown);
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [shown]);

  function pick(patch: CreatePatch) {
    const next = createPlateCreateConfig({
      ...config,
      menuAccent: pickedMenuAccent,
      ...patch,
    });

    if (patch.menuAccent) setPickedMenuAccent(patch.menuAccent);
    setConfig(next);
    window.history.replaceState(null, '', getPlateCreatePath(next));
  }

  function preview(patch: CreatePatch) {
    window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => {
      setOverride((current) =>
        JSON.stringify(current) === JSON.stringify(patch) ? current : patch
      );
    }, HOVER_SETTLE_MS);
  }

  function endPreview() {
    window.clearTimeout(previewTimer.current);
    setOverride(null);
  }

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden section-soft [--customizer-width:--spacing(48)] [--gap:--spacing(4)] md:[--gap:--spacing(6)] 2xl:[--customizer-width:--spacing(56)]">
      <div
        className="flex min-h-0 flex-1 flex-col gap-(--gap) p-(--gap) pt-[calc(var(--gap)*0.25)] md:flex-row-reverse"
        data-slot="designer"
      >
        <div className="relative flex flex-1 flex-col justify-center overflow-hidden rounded-[calc(var(--radius)*1.8)] ring ring-foreground/10 md:ring-muted dark:ring-foreground/10">
          <div className="relative z-0 mx-auto flex w-full flex-1 flex-col overflow-hidden">
            <div className="absolute inset-0 bg-muted dark:bg-muted/30" />
            <iframe
              ref={frameRef}
              className="z-10 size-full flex-1"
              src={previewUrl}
              title="Plate create preview"
            />
          </div>
        </div>
        <Customizer
          config={config}
          onPick={pick}
          onPreview={preview}
          onPreviewEnd={endPreview}
        />
      </div>
    </div>
  );
}
