import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, WithPlatePlugin } from '../types/plugins/PlatePlugin';

export type InjectedPlugin<
  P = {},
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Partial<PlatePlugin<P, V, E>>;

/**
 * Get all plugins having a defined `inject.pluginsByKey[plugin.key]`.
 * It includes `plugin` itself.
 */
export const getInjectedPlugins = <
  P = {},
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
