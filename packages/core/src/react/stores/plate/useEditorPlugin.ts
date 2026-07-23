import React from 'react';

import type { BasePluginInput, WithRequiredKey } from '../../../lib';

import {
  type InferConfig,
  type PlatePluginContext,
  getEditorPlugin,
} from '../../plugin';
import { type PlateStore, useEditor } from './createPlateStore';

/** Get editor and plugin context. */
export function useEditorPlugin<P extends BasePluginInput>(
  p: WithRequiredKey<P>,
  id?: string
): PlatePluginContext<InferConfig<P>> & {
  store: PlateStore;
} {
  const editor = useEditor({ id });

  return React.useMemo(
    () =>
      ({
        ...getEditorPlugin(editor, p),
        store: editor.store,
      }) as any,
    [editor, p]
  );
}
