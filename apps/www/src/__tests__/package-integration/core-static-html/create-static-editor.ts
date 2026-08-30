import {
  type BasePluginInput,
  type CreateEditorOptions,
  type Value,
  createEditor,
} from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

export const createStaticEditor = <
  const TPlugins extends readonly BasePluginInput[] = typeof BaseEditorKit,
>(
  value: Value,
  options?: Omit<
    CreateEditorOptions<Value, readonly [], TPlugins>,
    'initialValue' | 'plugins'
  > & { plugins?: TPlugins }
) => {
  const { plugins: configuredPlugins, ...editorOptions } = options ?? {};
  const plugins: readonly BasePluginInput[] =
    configuredPlugins ?? BaseEditorKit;

  return createEditor({
    ...editorOptions,
    plugins,
    initialValue: value,
  });
};
