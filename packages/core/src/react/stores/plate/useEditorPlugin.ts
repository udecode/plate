import React from 'react';

import type { AnyPluginConfig, WithRequiredKey } from '../../../lib';
import type { PlateEditor } from '../../editor';

import {
  type InferConfig,
  type PlatePlugin,
  type PlatePluginContext,
  getEditorPlugin,
} from '../../plugin';
import { type PlateStore, useEditorRef } from './createPlateStore';

/** Get editor and plugin context. */
export function useEditorPlugin<
  P extends AnyPluginConfig | PlatePlugin<AnyPluginConfig>,
  E extends PlateEditor = PlateEditor,
>(
  p: WithRequiredKey<P>,
  id?: string
): PlatePluginContext<InferConfig<P> extends never ? P : InferConfig<P>, E> & {
  store: PlateStore;
} {
  const editor = useEditorRef(id);

  return React.useMemo(
    () =>
      ({
        ...getEditorPlugin(editor, p),
        store: editor.store,
      }) as any,
    [editor, p]
  );
}
