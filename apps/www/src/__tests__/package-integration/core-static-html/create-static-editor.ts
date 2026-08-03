import type { BasePluginInput, CreateBaseEditorOptions, Value } from 'platejs';
import { createBaseEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

export const createStaticEditor = <
  const TPlugins extends readonly BasePluginInput[] = typeof BaseEditorKit,
>(
  value: Value,
  options?: Omit<
    CreateBaseEditorOptions<TPlugins>,
    'initialValue' | 'plugins'
  > & { plugins?: TPlugins }
) => {
  const { plugins: configuredPlugins, ...editorOptions } = options ?? {};
  const plugins: readonly BasePluginInput[] =
    configuredPlugins ?? BaseEditorKit;

  return createBaseEditor({
    ...editorOptions,
    plugins,
    initialValue: value,
  });
};
