import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import * as React from 'react';

import { useEditor, useElement } from '../../react/core';
import { ExcalidrawPlugin } from './ExcalidrawPlugin';

/**
 * Synchronizes the current Excalidraw node with a mounted canvas. Supply the
 * lazily loaded Excalidraw namespace and its imperative API. Document changes
 * replace the canvas scene without a save echo and clear obsolete canvas undo.
 * Excalidraw's serializer filters transient state and retains referenced files.
 */
export function useExcalidrawSync({
  api,
  excalidraw,
}: {
  api: ExcalidrawImperativeAPI | null;
  excalidraw: Pick<
    typeof import('@excalidraw/excalidraw'),
    'restore' | 'serializeAsJSON'
  > | null;
}): void {
  const editor = useEditor();
  const element = useElement(ExcalidrawPlugin);
  const key = editor.key(element);
  const synchronize = React.useRef<(() => void) | null>(null);

  React.useLayoutEffect(() => {
    if (!api || !excalidraw || !key) return undefined;
    let active = true;
    let applying = false;
    let source: typeof element.data;
    let canvasJSON: string | undefined;
    const current = () =>
      editor.read.nodes.get(key, { type: ExcalidrawPlugin });
    const sync = () => {
      const entry = current();
      if (!active || applying || !entry || api.getAppState().isLoading) return;
      if (canvasJSON !== undefined && source === entry[0].data) return;
      source = entry[0].data;
      const data = structuredClone(source);
      const restored = excalidraw.restore(
        {
          elements: data?.elements,
          appState: data?.state,
          files: data?.files,
        } as ImportedDataState,
        null,
        null
      );
      canvasJSON = excalidraw.serializeAsJSON(
        restored.elements,
        restored.appState,
        restored.files,
        'local'
      );
      const serialized = JSON.parse(canvasJSON) as ImportedDataState;
      applying = true;
      try {
        api.addFiles(Object.values(restored.files));
        api.updateScene({
          elements: restored.elements,
          appState: { ...api.getAppState(), ...serialized.appState },
          captureUpdate: 'NEVER',
        });
        api.history.clear();
      } finally {
        applying = false;
      }
    };
    synchronize.current = sync;
    const unsubscribe = api.onChange((elements, state, files) => {
      if (!active || applying || state.isLoading) return;
      const entry = current();
      if (!entry) return;
      if (canvasJSON === undefined || source !== entry[0].data) {
        sync();
        return;
      }
      if (editor.read.view.isReadOnly()) return;
      const nextJSON = excalidraw.serializeAsJSON(
        elements,
        state,
        files,
        'local'
      );
      if (nextJSON === canvasJSON) return;
      const serialized = JSON.parse(nextJSON) as {
        appState: NonNullable<typeof element.data>['state'];
        elements: NonNullable<typeof element.data>['elements'];
        files: NonNullable<typeof element.data>['files'];
      };
      const data = {
        elements: serialized.elements,
        state: serialized.appState,
        files: serialized.files,
      };
      canvasJSON = nextJSON;
      source = data;
      editor.update.nodes.set({ data }, { at: entry[1] });
      source = current()?.[0].data;
    });
    sync();
    return () => {
      active = false;
      synchronize.current = null;
      unsubscribe();
    };
  }, [api, editor, excalidraw, key]);

  React.useLayoutEffect(() => {
    synchronize.current?.();
  }, [element.data]);
}
