import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export type InjectedPlugin<T = {}> = Partial<PlatePlugin<T>>;

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`.
 * It includes `plugin` itself.
 */
export const getInjectedPlugins = <T = {}, P = {}>(
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
): InjectedPlugin<T>[] => {
  const injectedPlugins: InjectedPlugin<T>[] = [];

  [...editor.plugins].reverse().forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin);
  });

  return [plugin as InjectedPlugin<T>, ...injectedPlugins];
};
