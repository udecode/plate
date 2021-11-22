import { cloneDeep } from 'lodash';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePluginComponent';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Creates a new array of plugins by overriding the plugins in the original array.
 * Components can be overridden by key using `components` in the second param.
 * Any other properties can be overridden by key using `overrideByKey` in the second param.
 */
export const createPlugins = <T extends {} = {}>(
  plugins: PlatePlugin<T>[],
  {
    components,
    overrideByKey,
  }: {
    /**
     * Override plugin component by key.
     */
    components?: Record<string, PlatePluginComponent>;

    /**
     * Override plugin by key.
     */
    overrideByKey?: OverrideByKey<T>;
  } = {}
): PlatePlugin<T>[] => {
  let allOverrideByKey: OverrideByKey<T> = {};

  if (overrideByKey) {
    allOverrideByKey = cloneDeep(overrideByKey);
  }

  if (components) {
    Object.keys(components).forEach((key) => {
      if (!allOverrideByKey[key]) allOverrideByKey[key] = {};

      allOverrideByKey[key].component = components[key];
    });
  }

  if (Object.keys(allOverrideByKey).length) {
    return plugins.map((plugin) => {
      return overridePluginsByKey<T, {}>(plugin, allOverrideByKey);
    });
  }

  return plugins;
};
