import { OverrideByKey } from '../types/OverrideByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { NoInfer } from '../types/utility/NoInfer';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Create plugin factory with a default plugin.
 * - first param is the default plugin.
 * - the only required property of the default plugin is `key`.
 * - returns a plugin factory:
 *   - first param `override` can be used to (deeply) override the default plugin.
 *   - second param `overrideByKey` can be used to (deeply) override by key a nested plugin (in plugin.plugins).
 */
export const createPluginFactory = <P = {}>(
  defaultPlugin: PlatePlugin<{}, NoInfer<P>>
) => <T = {}>(
  override?: Partial<PlatePlugin<T, NoInfer<P>>>,
  overrideByKey: OverrideByKey<T> = {}
): PlatePlugin<T, NoInfer<P>> => {
  overrideByKey[defaultPlugin.key] = override as any;

  return overridePluginsByKey<T, P>({ ...defaultPlugin } as any, overrideByKey);
};
