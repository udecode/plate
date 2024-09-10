import mergeWith from 'lodash/mergeWith.js';
import {PluginConfig, SlatePlugin} from '../lib';

export function mergePlugins<
  K extends string = any,
  O = {},
  A = {},
  T = {},
>(
  basePlugin: SlatePlugin<PluginConfig<K, O, A, T>>,
  ...sourcePlugins: Partial<PluginConfig<K, O, A, T>>[]
): SlatePlugin<PluginConfig<K, O, A, T>>;

export function mergePlugins<
  K extends string = any,
  O = {},
  A = {},
  T = {},
>(
  basePlugin: Partial<SlatePlugin<PluginConfig<K, O, A, T>>>,
  ...sourcePlugins: Partial<PluginConfig<K, O, A, T>>[]
): Partial<SlatePlugin<PluginConfig<K, O, A, T>>>;

export function mergePlugins<
  K extends string = any,
  O = {},
  A = {},
  T = {},
>(
  basePlugin: Partial<SlatePlugin<PluginConfig<K, O, A, T>>>,
  ...sourcePlugins: Partial<PluginConfig<K, O, A, T>>[]
): Partial<SlatePlugin<PluginConfig<K, O, A, T>>> {
  return mergeWith(
    {},
    basePlugin,
    ...sourcePlugins,
    (objValue: unknown, srcValue: unknown, key: keyof SlatePlugin) => {
      // Overwrite plugins without cloning
      if (key === 'plugins') {
        return srcValue;
      }

      // Shallow merge options
      if (key === 'options') {
        return { ...objValue as any, ...srcValue as any };
      }
    }
  );
};
