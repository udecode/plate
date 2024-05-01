import type { Value } from '@udecode/slate';

import defaultsDeep from 'lodash/defaultsDeep.js';

import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { mergeDeepPlugins } from './mergeDeepPlugins';
import { setDefaultPlugin } from './setDefaultPlugin';

/** Recursively merge plugin.plugins into editor.plugins and editor.pluginsByKey */
export const flattenDeepPlugins = <V extends Value>(
  editor: PlateEditor<V>,
  plugins?: PlatePlugin<{}, V>[]
) => {
  if (!plugins) return;

  plugins.forEach((plugin) => {
    let p = setDefaultPlugin(plugin);

    p = mergeDeepPlugins<V>(editor, p);

    if (p.enabled === false) return;
    if (editor.pluginsByKey[p.key]) {
      const index = editor.plugins.indexOf(editor.pluginsByKey[p.key]);

      const mergedPlugin = defaultsDeep(p, editor.pluginsByKey[p.key]);

      if (index >= 0) {
        editor.plugins[index] = mergedPlugin;
      }

      editor.pluginsByKey[p.key] = mergedPlugin;
    } else {
      editor.plugins.push(p);
      editor.pluginsByKey[p.key] = p;
    }

    flattenDeepPlugins(editor, p.plugins!);
  });
};
