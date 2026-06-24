import type { AnyPluginConfig } from '../../lib/plugin/BasePlugin';

import { createBasePlateEditor } from '../../lib/editor';
import { createEditorPlugin } from '../../lib/plugin/createEditorPlugin';
import { resolvePlugin } from './resolvePlugin';

type CreateEditorPluginInput = Parameters<typeof createEditorPlugin>[0];

export const resolvePluginTest = <P extends AnyPluginConfig>(p: P) => {
  const editor = createBasePlateEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.getPlugin({ key });
};

export const resolveCreatePluginTest = ((plugin: CreateEditorPluginInput) => {
  const p = createEditorPlugin(plugin);

  const editor = createBasePlateEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.getPlugin({ key });
}) as typeof createEditorPlugin;
