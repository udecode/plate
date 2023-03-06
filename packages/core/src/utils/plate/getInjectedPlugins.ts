import { Value } from '@udecode/slate';
import { PlateEditor } from '../../types/plate/PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from '../../types/plugin/PlatePlugin';

export type InjectedPlugin<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Partial<PlatePlugin<P, V, E>>;

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`.
 * It includes `plugin` itself.
 */
export const getInjectedPlugins = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: PlateEditor<V>,
  plugin: WithPlatePlugin<P, V, E>
): InjectedPlugin<P, V, E>[] => {
  const injectedPlugins: InjectedPlugin<P, V, E>[] = [];

  [...editor.plugins].reverse().forEach((p) => {
    const injectedPlugin = p.inject.pluginsByKey?.[
      plugin.key
    ] as InjectedPlugin<P, V, E>;

    if (injectedPlugin) injectedPlugins.push(injectedPlugin);
  });

  return [plugin as InjectedPlugin<P, V, E>, ...injectedPlugins];
};
