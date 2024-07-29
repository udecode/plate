import merge from 'lodash/merge.js';

import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { mergeDeepPlugins } from './mergeDeepPlugins';

/** Recursively merge plugin.plugins into editor.plugins and editor.pluginsByKey */
export const flattenDeepPlugins = (
  editor: PlateEditor,
  plugins?: PlatePlugin[]
) => {
  if (!plugins) return;

  plugins.forEach((plugin) => {
    plugin = mergeDeepPlugins(editor, plugin);

    if (plugin.enabled === false) return;
    if (editor.pluginsByKey[plugin.key]) {
      const index = editor.plugins.indexOf(editor.pluginsByKey[plugin.key]);
      const mergedPlugin = merge({}, editor.pluginsByKey[plugin.key], plugin);

      if (index >= 0) {
        editor.plugins[index] = mergedPlugin;
      }

      editor.pluginsByKey[plugin.key] = mergedPlugin;
    } else {
      editor.plugins.push(plugin);
      editor.pluginsByKey[plugin.key] = plugin;
    }

    flattenDeepPlugins(editor, plugin.plugins!);
  });
};
