import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin, PlatePlugin } from '../types/plugin/PlatePlugin';

export type InjectedPlugin<O = {}, T = {}, Q = {}, S = {}> = Partial<
  PlatePlugin<O, T, Q, S>
>;

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`. It
 * includes `plugin` itself.
 */
export const getInjectedPlugins = <O, T, Q, S>(
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
): InjectedPlugin<O, T, Q, S>[] => {
  const injectedPlugins: InjectedPlugin<O, T, Q, S>[] = [];

  [...editor.plugins].reverse().forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[
      plugin.key
    ] as InjectedPlugin<O, T, Q, S>;

    if (injectedPlugin) injectedPlugins.push(injectedPlugin);
  });

  return [plugin as InjectedPlugin<O, T, Q, S>, ...injectedPlugins];
};
