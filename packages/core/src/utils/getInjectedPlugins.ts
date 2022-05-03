import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export type InjectedPlugin<V extends Value, T = {}> = Partial<
  PlatePlugin<V, T>
>;

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`.
 * It includes `plugin` itself.
 */
export const getInjectedPlugins = <V extends Value, T = {}, P = {}>(
  editor: PlateEditor<V, T>,
  plugin: WithPlatePlugin<V, T, P>
): InjectedPlugin<V, T>[] => {
  const injectedPlugins: InjectedPlugin<V, T>[] = [];

  [...editor.plugins].reverse().forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[
      plugin.key
    ] as InjectedPlugin<V, T>;

    if (injectedPlugin) injectedPlugins.push(injectedPlugin);
  });

  return [plugin as InjectedPlugin<V, T>, ...injectedPlugins];
};
