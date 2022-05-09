import { cloneDeep } from 'lodash';
import { Value } from '../slate/editor/TEditor';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { PlatePluginComponent } from '../types/plugins/PlatePluginComponent';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Creates a new array of plugins by overriding the plugins in the original array.
 * Components can be overridden by key using `components` in the second param.
 * Any other properties can be overridden by key using `overrideByKey` in the second param.
 */
export const createPlugins = <V extends Value, T extends {} = {}>(
  plugins: PlatePlugin<V, T>[],
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
    overrideByKey?: OverrideByKey<V, T>;
  } = {}
): PlatePlugin<V, T>[] => {
  let allOverrideByKey: OverrideByKey<V, T> = {};

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
      return overridePluginsByKey<V, T, {}>(plugin, allOverrideByKey);
    });
  }

  return plugins;
};
