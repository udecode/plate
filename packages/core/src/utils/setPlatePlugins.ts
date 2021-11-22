import { incrementKey } from '../stores/plate/plate.actions';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { flattenDeepPlugins } from './flattenDeepPlugins';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Flatten deep plugins then set editor.plugins and editor.pluginsByKey
 */
export const setPlatePlugins = <T = {}>(
  editor: PlateEditor<T>,
  plugins: PlatePlugin<T>[]
) => {
  editor.plugins = [];
  editor.pluginsByKey = {};

  flattenDeepPlugins(editor, plugins);

  // override all the plugins one by one, so plugin.overrideByKey effects can be overridden by the next plugin
  editor.plugins.forEach((plugin) => {
    if (plugin.overrideByKey) {
      const newPlugins = editor.plugins.map((p) => {
        return overridePluginsByKey<T, {}>(p, plugin.overrideByKey as any);
      });

      editor.plugins = [];
      editor.pluginsByKey = {};

      // flatten again the overrides
      flattenDeepPlugins(editor, newPlugins);
    }
  });

  incrementKey('keyPlugins', editor.id);
};
