import type { AnyPluginConfig } from '../../lib/plugin/PluginBase';

import { createBaseEditor } from '../../lib/editor';
import { createBasePlugin } from '../../lib/plugin/createBasePlugin';
import { resolvePlugin } from './resolvePlugin';

type CreateEditorPluginInput = Parameters<typeof createBasePlugin>[0];

export const resolvePluginTest = <P extends AnyPluginConfig>(p: P) => {
  const editor = createBaseEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.getPlugin({ key });
};

export const resolveCreatePluginTest = ((plugin: CreateEditorPluginInput) => {
  const p = createBasePlugin(plugin);

  const editor = createBaseEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.getPlugin({ key });
}) as typeof createBasePlugin;
