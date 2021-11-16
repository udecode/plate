import { cloneDeep } from 'lodash';
import { OverridesByKey } from '../types/OverridesByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePlugin/PlatePluginComponent';
import { overridePluginsByKey } from './overridePluginsByKey';

export const createPlugins = <T extends {} = {}>(
  plugins: PlatePlugin<T>[],
  {
    components,
    overrides,
  }: {
    /**
     * Override plugin component by key.
     */
    components?: Record<string, PlatePluginComponent>;

    /**
     * Override plugin by key.
     */
    overrides?: OverridesByKey<T>;
  } = {}
): PlatePlugin<T>[] => {
  let overridesByKey: OverridesByKey<T> = {};

  if (overrides) {
    overridesByKey = cloneDeep(overrides);
  }

  if (components) {
    Object.keys(components).forEach((key) => {
      if (!overridesByKey[key]) overridesByKey[key] = {};

      overridesByKey[key].component = components[key];
    });
  }

  if (Object.keys(overridesByKey).length) {
    return plugins.map((plugin) => {
      return overridePluginsByKey<T, {}>(plugin, overridesByKey);
    });
  }

  return plugins;
};
