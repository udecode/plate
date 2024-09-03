import type {
  AnyPluginConfig,
  InferConfig,
  WithRequiredKey,
} from '../../../../lib';
import type { PlateEditor } from '../../../editor';

import {
  type PlatePlugin,
  type PlatePluginContext,
  getEditorPlugin,
} from '../../../plugin';
import { useEditorRef } from './useEditorRef';

/** Get editor and plugin context. */
export function useEditorPlugin<
  P extends AnyPluginConfig | PlatePlugin<AnyPluginConfig>,
  E extends PlateEditor = PlateEditor,
>(
  p: WithRequiredKey<P>,
  id?: string
): PlatePluginContext<InferConfig<P> extends never ? P : InferConfig<P>, E> {
  const editor = useEditorRef(id);

  return getEditorPlugin(editor, p) as any;
}
