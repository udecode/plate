import type { AnyPluginConfig } from '../plugin/BasePlugin';

import { createSlateEditor } from '../editor';
import { createSlatePlugin } from '../plugin/createSlatePlugin';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <P extends AnyPluginConfig>(p: P) => {
  const editor = createSlateEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.plugins[key];
};

export const resolveCreatePluginTest = ((plugin: AnyPluginConfig) => {
  const p = createSlatePlugin(plugin);

  const editor = createSlateEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.plugins[key];
}) as typeof createSlatePlugin;
