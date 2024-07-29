import cloneDeep from 'lodash/cloneDeep.js';

import type { OverrideByKey } from '../types/OverrideByKey';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';
import type { PlatePluginComponent } from '../types/plugin/PlatePluginComponent';

import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Creates a new array of plugins by overriding the plugins in the original
 * array. Components can be overridden by key using `components` in the second
 * param. Any other properties can be overridden by key using `overrideByKey` in
 * the second param.
 */
export const createPlugins = (
  plugins: PlatePlugin[],
  {
    components,
    overrideByKey,
  }: {
    /** Override plugin component by key. */
    components?: Record<string, PlatePluginComponent>;

    /** Override plugin by key. */
    overrideByKey?: OverrideByKey;
  } = {}
): PlatePlugin[] => {
  let allOverrideByKey: OverrideByKey = {};

  if (overrideByKey) {
    allOverrideByKey = cloneDeep(overrideByKey);
  }
  if (components) {
    Object.keys(components).forEach((key) => {
      if (!allOverrideByKey[key]) allOverrideByKey[key] = {};

      allOverrideByKey[key].component = components[key];
    });
  }
  if (Object.keys(allOverrideByKey).length > 0) {
    return plugins.map((plugin) => {
      return overridePluginsByKey(plugin as any, allOverrideByKey as any);
    });
  }

  return plugins as PlatePlugin[];
};
