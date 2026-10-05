import {
  type BasePluginInput,
  type CreateEditorOptions,
  type Editor,
  type Value,
  createEditor,
} from 'platejs';
import { renderStaticHtml } from 'platejs/static';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

export const createStaticEditor = <
  const TPlugins extends readonly BasePluginInput[] = typeof BaseEditorKit,
>(
  value: Value,
  options?: Omit<
    CreateEditorOptions<Value, TPlugins>,
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

export const renderStaticMarkup = async (editor: Editor) => {
  const { data } = await renderStaticHtml(editor);

  return data
    .replaceAll(/ class="[^"]*"/g, '')
    .replaceAll(
      / data-editor(?:-(?:end|leaf|node|path|root|start|string|void))?="[^"]*"/g,
      ''
    );
};
