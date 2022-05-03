import defaultsDeep from 'lodash/defaultsDeep';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';
import values from 'lodash/values';
import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { WithPlatePlugin } from '../types/plugins/PlatePlugin';

/**
 * Recursively merge nested plugins into the root plugins
 */
export const mergeDeepPlugins = <
  V extends Value,
  T = {},
  P extends WithPlatePlugin<V, T> = WithPlatePlugin<V, T>
>(
  editor: PlateEditor<V, T>,
  _plugin: P
): P => {
  const plugin = { ..._plugin };

  const { then } = plugin;
  if (then) {
    delete plugin.then;

    const { plugins: pluginPlugins } = plugin;

    const pluginThen = mergeDeepPlugins<V, T, P>(
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
