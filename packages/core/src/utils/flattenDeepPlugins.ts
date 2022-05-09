import defaultsDeep from 'lodash/defaultsDeep';
import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';
import { mergeDeepPlugins } from './mergeDeepPlugins';
import { setDefaultPlugin } from './setDefaultPlugin';

/**
 * Recursively merge plugin.plugins into editor.plugins and editor.pluginsByKey
 */
export const flattenDeepPlugins = <V extends Value, T = {}>(
  editor: PlateEditor<V, T>,
  plugins?: PlatePlugin<V, T>[]
) => {
  if (!plugins) return;

  plugins.forEach((plugin) => {
    let p = setDefaultPlugin(plugin as PlatePlugin<V>) as WithPlatePlugin<V, T>;

    p = mergeDeepPlugins<V, T>(editor, p);

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
