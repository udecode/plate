import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin, PlatePluginList } from '../types/plugin/PlatePlugin';

export type InjectedPlugin<
  K extends string = '',
  O = {},
  A = {},
  T = {},
  S = {},
> = Partial<PlatePlugin<K, O, A, T, S>>;

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`. It
 * includes `plugin` itself.
 */
export const getInjectedPlugins = <
  K extends string = '',
  O = {},
  A = {},
  T = {},
  S = {},
>(
  editor: PlateEditor,
  plugin: PlatePlugin<K, O, A, T, S>
): PlatePluginList => {
  const injectedPlugins: PlatePluginList = [];

  [...editor.plugins].reverse().forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin as any);
  });

  return [plugin, ...injectedPlugins];
};
