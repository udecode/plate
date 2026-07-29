import type { BasePluginInput } from '../../lib/editor';

import { createBaseEditor } from '../../lib/editor';

export const resolvePluginTest = <P extends BasePluginInput>(plugin: P) => {
  const editor = createBaseEditor({
    plugins: [plugin],
  });

  return editor.getPlugin(plugin);
};
