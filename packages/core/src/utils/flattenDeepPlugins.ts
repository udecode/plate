import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { mergeDeepPlugins } from './mergeDeepPlugins';
import { setDefaultPlugin } from './setDefaultPlugin';

/**
 * Recursively merge plugin.plugins into editor.plugins and editor.pluginsByKey
 */
export const flattenDeepPlugins = <T = {}>(
  editor: PlateEditor<T>,
  plugins?: PlatePlugin<T>[]
) => {
  if (!plugins) return;

  plugins.forEach((plugin) => {
    let p = setDefaultPlugin(plugin);

    p = mergeDeepPlugins(editor, p);

    editor.plugins.push(p);
    editor.pluginsByKey[p.key] = p;

    flattenDeepPlugins<T>(editor, p.plugins!);
  });
};
