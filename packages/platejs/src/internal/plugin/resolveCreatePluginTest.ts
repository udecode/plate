import type { BasePluginInput } from '../../lib/editor';
import { createEditor } from '../../lib/editor/withPlite';

export const resolvePluginTest = (plugin: BasePluginInput) => {
  const editor = createEditor({
    plugins: [plugin],
  });

  return editor.plugin(plugin.name);
};
