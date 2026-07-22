import type { BasePluginInput } from '../../lib/editor';

import { createBaseEditor } from '../../lib/editor';
import { resolvePlugin } from './resolvePlugin';

export const resolvePluginTest = <P extends BasePluginInput>(p: P) => {
  const editor = createBaseEditor({
    plugins: [p],
  }) as any;

  let key = p.key;

  if (!key) {
    key = resolvePlugin(editor, p as any).key;
  }

  return editor.getPlugin({ key });
};
