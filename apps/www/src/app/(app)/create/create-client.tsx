'use client';

/* oxlint-disable react/iframe-missing-sandbox -- Next hydration reads document.cookie before app code; the preview renders trusted registry source and a scripts-only sandbox crashes hydration. */

import * as React from 'react';

import {
  createPlateCreateConfig,
  getPlateCreatePath,
  getPlateCreatePreset,
  getPlateCreatePreviewPath,
  PLATE_CREATE_EDITORS,
  type PlateCreateConfig,
} from '@/lib/plate-create';
import { cn } from '@/lib/utils';

import type { CreateShortcutAction } from './create-actions';
import { type CreatePatch, Customizer } from './customizer';

const HOVER_SETTLE_MS = 50;
const MAX_HISTORY = 50;

const PREVIEW_SWITCHER_ITEMS = [
  { label: 'Sink', value: 'sink' as const },
  ...PLATE_CREATE_EDITORS.map((editor) => ({
    label: editor.title.replace(/\s+editor$/i, ''),
    value: editor.name,
  })),
];

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
      view: config.view,
    },
    window.location.origin
  );
}

export function CreateClient({
  initialConfig,
}: {
  initialConfig: PlateCreateConfig;
}) {
  const [history, setHistory] = React.useState<{
    entries: PlateCreateConfig[];
    index: number;
  }>(() => ({ entries: [initialConfig], index: 0 }));
  const config = history.entries[history.index];
  const canUndo = history.index > 0;
  const canRedo = history.index < history.entries.length - 1;
  const [override, setOverride] = React.useState<CreatePatch | null>(null);
  const [pickedMenuAccent, setPickedMenuAccent] = React.useState(
    initialConfig.menuAccent
  );
  const [previewUrl] = React.useState(() =>
    getPlateCreatePreviewPath(initialConfig)
  );
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const shortcutRef = React.useRef<
    ((action: CreateShortcutAction) => void) | null
  >(null);
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
      if (event.source !== frameRef.current?.contentWindow) return;

      if (event.data?.type === 'plate-create-ready') {
        postConfig(frameRef.current, shown);
      } else if (
        event.data?.type === 'plate-create-shortcut' &&
        typeof event.data.action === 'string'
      ) {
        shortcutRef.current?.(event.data.action as CreateShortcutAction);
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
    setHistory((current) => {
      const prev = current.entries[current.index];

      if (JSON.stringify(prev) === JSON.stringify(next)) return current;

      const truncated = current.entries.slice(0, current.index + 1);
      const entries = [...truncated, next].slice(-MAX_HISTORY);

      return { entries, index: entries.length - 1 };
    });
    window.history.replaceState(null, '', getPlateCreatePath(next));
  }

  function undo() {
    setHistory((current) => {
      if (current.index <= 0) return current;

      const nextIndex = current.index - 1;
      const target = current.entries[nextIndex];

      setPickedMenuAccent(target.menuAccent);
      window.history.replaceState(null, '', getPlateCreatePath(target));

      return { ...current, index: nextIndex };
    });
  }

  function redo() {
    setHistory((current) => {
      if (current.index >= current.entries.length - 1) return current;

      const nextIndex = current.index + 1;
      const target = current.entries[nextIndex];

      setPickedMenuAccent(target.menuAccent);
      window.history.replaceState(null, '', getPlateCreatePath(target));

      return { ...current, index: nextIndex };
    });
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

  const activeCanvas = config.view === 'sink' ? 'sink' : config.editor;

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
          <div
            aria-label="Preview view"
            className="dark absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-xl bg-card/90 p-1 shadow-xl ring-1 ring-foreground/10 backdrop-blur-xl"
            data-slot="preview-switcher"
            role="group"
          >
            {PREVIEW_SWITCHER_ITEMS.map((item) => {
              const active = activeCanvas === item.value;

              return (
                <button
                  key={item.value}
                  aria-pressed={active}
                  className={cn(
                    'h-7 min-w-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  data-active={active}
                  onClick={() =>
                    item.value === 'sink'
                      ? pick({ view: 'sink' })
                      : pick({ editor: item.value, view: 'editor' })
                  }
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <Customizer
          canRedo={canRedo}
          canUndo={canUndo}
          config={config}
          onPick={pick}
          onPreview={preview}
          onPreviewEnd={endPreview}
          onRedo={redo}
          onUndo={undo}
          shortcutRef={shortcutRef}
        />
      </div>
    </div>
  );
}
