import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';
import { overridePluginsByKey } from './overridePluginsByKey';

export const createPlugins = <T extends {} = {}>(
  plugins: PlatePlugin<T>[],
  {
    components,
  }: {
    /**
     * Components stored by plugin key.
     * These will be merged into `options`.
     * @see {@link EditorId}
     */
    components?: Record<string, PlatePluginComponent>;
  } = {}
): PlatePlugin<T>[] => {
  if (components) {
    const componentPluginsByKey = {};
    Object.keys(components).forEach((key) => {
      componentPluginsByKey[key] = {
        component: components[key],
      };
    });

    return plugins.map((plugin) => {
      return overridePluginsByKey<T>(plugin, componentPluginsByKey);
    });
  }

  return plugins;
};
