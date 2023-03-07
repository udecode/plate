import { Value } from '@udecode/slate';
import defaultsDeep from 'lodash/defaultsDeep';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugin/PlatePlugin';
import { mergeDeepPlugins } from './mergeDeepPlugins';
import { setDefaultPlugin } from './setDefaultPlugin';

/**
 * Recursively merge plugin.plugins into editor.plugins and editor.pluginsByKey
 */
export const flattenDeepPlugins = <V extends Value>(
  editor: PlateEditor<V>,
  plugins?: PlatePlugin<{}, V>[]
) => {
  if (!plugins) return;

  plugins.forEach((plugin) => {
    let p = setDefaultPlugin(plugin);

    p = mergeDeepPlugins<V>(editor, p);

    if (!editor.pluginsByKey[p.key]) {
      editor.plugins.push(p);
      editor.pluginsByKey[p.key] = p;
    } else {
      const index = editor.plugins.indexOf(editor.pluginsByKey[p.key]);

      const mergedPlugin = defaultsDeep(p, editor.pluginsByKey[p.key]);

      if (index >= 0) {
        editor.plugins[index] = mergedPlugin;
      }
      editor.pluginsByKey[p.key] = mergedPlugin;
    }

    flattenDeepPlugins(editor, p.plugins!);
  });
};
