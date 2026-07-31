import type { BasePluginInput } from '../../lib/editor';

import { createPlateEditor } from '../../react/editor/withPlate';

export const resolvePluginTest = <P extends BasePluginInput>(plugin: P) => {
  const editor = createPlateEditor({
    plugins: [plugin],
  });

  return editor.plugin(plugin.name).plugin;
};
