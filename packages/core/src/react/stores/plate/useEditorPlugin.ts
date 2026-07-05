import React from 'react';

import type {
  AnyPluginConfig,
  PluginBaseContext,
  PluginConfig,
  WithRequiredKey,
} from '../../../lib';
import type { PlateEditor } from '../../editor';

import { getEditorPlugin } from '../../plugin';
import { type PlateStore, useEditorRef } from './createPlateStore';

type InferEditorPluginConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends AnyPluginConfig
    ? P
    : PluginConfig;

type UseEditorPluginContext<
  C extends AnyPluginConfig,
  E extends PlateEditor,
> = PluginBaseContext<C> & {
  editor: E;
  plugin: {
    api: C['api'];
    key: C['key'];
    options: C['options'];
    selectors: C['selectors'];
  };
  store: PlateStore;
};

/** Get editor and plugin context. */
export function useEditorPlugin<
  P extends { key: string; readonly __config?: AnyPluginConfig },
  E extends PlateEditor = PlateEditor,
>(
  p: WithRequiredKey<P>,
  id?: string
): UseEditorPluginContext<InferEditorPluginConfig<P>, E> {
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
