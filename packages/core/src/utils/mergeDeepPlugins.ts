import defaultsDeep from 'lodash/defaultsDeep';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';
import values from 'lodash/values';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';

/**
 * Recursively merge nested plugins into the the root plugins
 */
export const mergeDeepPlugins = <T = {}, P = {}>(
  editor: PlateEditor<T>,
  _plugin: PlatePlugin<T, NoInfer<P>>
): PlatePlugin<T, NoInfer<P>> => {
  const plugin = { ..._plugin };

  const { then } = plugin;
  if (then) {
    delete plugin.then;

    const { plugins: pluginPlugins } = plugin;

    const pluginThen = mergeDeepPlugins<T, P>(
      editor,
      defaultsDeep(then(editor, plugin), plugin)
    );

    // merge plugins by key
    if (pluginPlugins && pluginThen.plugins) {
      const merged = merge(
        keyBy(pluginPlugins, 'key'),
        keyBy(pluginThen.plugins, 'key')
      );

      pluginThen.plugins = values(merged);
    }

    return pluginThen;
  }

  return plugin;
};
