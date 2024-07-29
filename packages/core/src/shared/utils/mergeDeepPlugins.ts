import defaultsDeep from 'lodash/defaultsDeep.js';
import keyBy from 'lodash/keyBy.js';
import merge from 'lodash/merge.js';
import values from 'lodash/values.js';

import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { callOrReturn } from './misc/callOrReturn';

/** Recursively merge nested plugins into the root plugins */
export const mergeDeepPlugins = <P extends PlatePlugin = PlatePlugin>(
  editor: PlateEditor,
  _plugin: P
): P => {
  const plugin = { ..._plugin } as any;

  const { __extend } = plugin;

  if (__extend) {
    delete plugin.__extend;

    const { plugins: pluginPlugins } = plugin;

    const extendedPlugin = mergeDeepPlugins(
      editor,
      defaultsDeep(callOrReturn(__extend, editor, plugin), plugin)
    );

    // merge plugins by key
    if (pluginPlugins && extendedPlugin.plugins) {
      const merged = merge(
        keyBy(pluginPlugins, 'key'),
        keyBy(extendedPlugin.plugins, 'key')
      );

      extendedPlugin.plugins = values(merged);
    }

    return extendedPlugin;
  }

  return plugin;
};
