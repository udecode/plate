import type { PlateEditor } from '../editor';
import type {
  InferConfig,
  PlatePlugin,
  PlatePluginContext,
} from './PlatePlugin';

import {
  type AnyPluginConfig,
  type WithRequiredKey,
  getEditorPlugin as getBaseEditorPlugin,
} from '../../lib';

export function getEditorPlugin<
  P extends AnyPluginConfig | PlatePlugin<AnyPluginConfig>,
>(
  editor: PlateEditor,
  plugin: WithRequiredKey<P>
): PlatePluginContext<InferConfig<P> extends never ? P : InferConfig<P>> {
  return {
    ...(getBaseEditorPlugin(editor, plugin) as any),
    useOption: (key: any, ...args: any) =>
      editor.useOption(plugin, key, ...args),
  };
}
