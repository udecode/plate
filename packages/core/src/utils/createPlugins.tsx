import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';
import { overridePluginsByKey } from './overridePluginsByKey';

export const createPlugins = (
  plugins: PlatePlugin[],
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
) => {
  if (components) {
    const componentPluginsByKey = {};
    Object.keys(components).forEach((key) => {
      componentPluginsByKey[key] = {
        component: components[key],
      };
    });

    return plugins.map((plugin) => {
      return overridePluginsByKey(plugin, componentPluginsByKey);
    });
  }

  return plugins;
};
