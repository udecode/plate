import type { NoInfer } from '../types/misc/NoInfer';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';

import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Create plugin factory with a default plugin.
 *
 * - First param is the default plugin.
 * - The only required property of the default plugin is `key`.
 * - Returns a plugin factory:
 *
 *   - First param `override` can be used to (deeply) override the default plugin.
 *   - Second param `overrideByKey` can be used to (deeply) override by key a nested
 *       plugin (in plugin.plugins).
 */
export const createPluginFactory =
  <O = {}, T = {}, Q = {}, S = {}>(
    defaultPlugin: PlatePlugin<NoInfer<O>, NoInfer<T>, NoInfer<Q>, NoInfer<S>>
  ) =>
  <OO = O, OT = T, OQ = Q, OS = S>(
    override?: Partial<
      PlatePlugin<NoInfer<OO>, NoInfer<OT>, NoInfer<OQ>, NoInfer<OS>>
    >,
    overrideByKey: Record<string, Partial<PlatePlugin<any, any, any, any>>> = {}
  ): PlatePlugin<NoInfer<OO>, NoInfer<OT>, NoInfer<OQ>, NoInfer<OS>> => {
    overrideByKey[defaultPlugin.key] = override as any;

    return overridePluginsByKey<OO, OT, OQ, OS>(
      { ...defaultPlugin } as any,
      overrideByKey
    );
  };
