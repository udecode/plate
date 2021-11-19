import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export type InjectedPlugin<T = {}> = Partial<PlatePlugin<T>>;

export const getInjectedPlugins = <T = {}, P = {}>(
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
): InjectedPlugin<T>[] => {
  const injectedPlugins: InjectedPlugin<T>[] = [];

  editor.plugins.forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[plugin.key];

    if (injectedPlugin) injectedPlugins.push(injectedPlugin);
  });

  return [plugin as InjectedPlugin<T>, ...injectedPlugins];
};
