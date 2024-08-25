import type { PlateEditor } from '../editor';
import type {
  AnyPlatePlugin,
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

export const omitPluginContext = <T extends PlatePluginContext<AnyPlatePlugin>>(
  ctx: T
) => {
  const {
    api,
    editor,
    getOption,
    getOptions,
    plugin,
    setOption,
    tf,
    type,
    useOption,
    ...rest
  } = ctx;

  return rest;
};
