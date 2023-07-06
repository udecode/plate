import { Value } from '@udecode/slate';
import { cloneDeep } from 'lodash';

import { OverrideByKey } from '../types/OverrideByKey';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin, PluginOptions } from '../types/plugin/PlatePlugin';
import { PlatePluginComponent } from '../types/plugin/PlatePluginComponent';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Creates a new array of plugins by overriding the plugins in the original array.
 * Components can be overridden by key using `components` in the second param.
 * Any other properties can be overridden by key using `overrideByKey` in the second param.
 */
export const createPlugins = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  plugins: PlatePlugin<PluginOptions, V, E>[],
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
    overrideByKey?: OverrideByKey<V, E>;
  } = {}
): PlatePlugin<PluginOptions, V, E>[] => {
  let allOverrideByKey: OverrideByKey<V, E> = {};

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
      return overridePluginsByKey<{}, V, E>(plugin, allOverrideByKey);
    });
  }

  return plugins;
};
