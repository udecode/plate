import { NoInfer } from '../common/types/utility/NoInfer';
import { Value } from '../slate/types/TEditor';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
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
  defaultPlugin: PlatePlugin<Value, {}, NoInfer<P>>
) => <V extends Value, T = {}>(
  override?: Partial<PlatePlugin<V, T, NoInfer<P>>>,
  overrideByKey: OverrideByKey<V, T> = {}
): PlatePlugin<V, T, NoInfer<P>> => {
  overrideByKey[defaultPlugin.key] = override as any;

  return overridePluginsByKey<V, T, P>(
    { ...defaultPlugin } as any,
    overrideByKey
  );
};
