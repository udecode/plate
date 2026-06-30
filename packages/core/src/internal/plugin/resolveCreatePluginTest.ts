import type {
  AnyPluginConfig,
  PluginConfig,
} from '../../lib/plugin/SlatePlugin';

import { createBaseEditor } from '../../lib/editor';
import {
  createBasePlugin,
  type CreateBasePluginInput,
} from '../../lib/plugin/createBasePlugin';
import { resolvePlugin } from './resolvePlugin';

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

export const resolveCreatePluginTest = ((plugin: CreateBasePluginInput) => {
  const p = createBasePlugin<PluginConfig>(plugin);

  const editor = createBaseEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.getPlugin({ key });
}) as typeof createBasePlugin;
