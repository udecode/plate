import type { PlateEditor } from '../../shared/types/PlateEditor';
import type { PlatePlugin } from '../../shared/types/plugin/PlatePlugin';
import type { PlateProps } from '../components';

import { flattenDeepPlugins } from '../../shared/utils/flattenDeepPlugins';
import { overridePluginsByKey } from '../../shared/utils/overridePluginsByKey';
import { getCorePlugins } from './getCorePlugins';

/** Flatten deep plugins then set editor.plugins and editor.pluginsByKey */
export const setEditorPlugins = (
  editor: PlateEditor,
  {
    plugins: _plugins = [],
    ...options
  }: Pick<PlateProps, 'disableCorePlugins' | 'maxLength' | 'plugins'>
) => {
  const plugins: PlatePlugin[] = [
    ...getCorePlugins(editor, options),
    ..._plugins,
  ];

  editor.plugins = [];
  editor.pluginsByKey = {};

  flattenDeepPlugins(editor, plugins);

  // override all the plugins one by one, so plugin.overrideByKey effects can be overridden by the next plugin
  editor.plugins.forEach((plugin) => {
    if (plugin.overrideByKey) {
      const newPlugins = editor.plugins.map((p) => {
        return overridePluginsByKey(p as any, plugin.overrideByKey as any);
      });

      editor.plugins = [];
      editor.pluginsByKey = {};

      // flatten again the overrides
      flattenDeepPlugins(editor, newPlugins as any);
    }
  });
};
