import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { mergeDeepPlugins } from './mergeDeepPlugins';

/**
 * Recursively merge plugin.plugins into editor.plugins and editor.pluginsByKey
 */
export const flattenDeepPlugins = <T = {}>(
  editor: PlateEditor<T>,
  plugins?: PlatePlugin<T>[]
) => {
  if (!plugins) return;

  plugins.forEach((p) => {
    if (p.type === undefined) p.type = p.key;
    if (p.overrideProps && !p.overrideProps.nodeKey) {
      p.overrideProps.nodeKey = p.key;
    }

    p = mergeDeepPlugins(editor, p);

    editor.plugins.push(p);
    editor.pluginsByKey[p.key] = p;

    flattenDeepPlugins<T>(editor, p.plugins);
  });
};
