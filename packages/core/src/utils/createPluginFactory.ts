import { OverrideByKey } from '../types/OverrideByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Create plugin factory with a default plugin.
 * The plugin factory:
 * - param 1 `override` can be used to (deeply) override the default plugin.
 * - param 2 `overrideByKey` can be used to (deeply) override a nested plugin (in plugin.plugins) by key.
 */
export const createPluginFactory = <P = {}>(
  defaultPlugin: PlatePlugin<{}, NoInfer<P>>
) => <T = {}>(
  override?: Partial<PlatePlugin<T, NoInfer<P>>>,
  overrideByKey: OverrideByKey<T> = {}
): PlatePlugin<T, NoInfer<P>> => {
  overrideByKey[defaultPlugin.key] = override as any;

  return overridePluginsByKey<T, P>(defaultPlugin as any, overrideByKey);
};
