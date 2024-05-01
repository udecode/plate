import type { Value } from '@udecode/slate';

import type { OverrideByKey } from '../types/OverrideByKey';
import type { PlateEditor } from '../types/PlateEditor';
import type { NoInfer } from '../types/misc/NoInfer';
import type { PlatePlugin, PluginOptions } from '../types/plugin/PlatePlugin';

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
  <
    P = PluginOptions,
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>,
  >(
    defaultPlugin: PlatePlugin<NoInfer<P>, V, E>
  ) =>
  <OP = P, OV extends Value = V, OE extends PlateEditor<OV> = PlateEditor<OV>>(
    override?: Partial<PlatePlugin<NoInfer<OP>, OV, OE>>,
    overrideByKey: OverrideByKey<OV, OE> = {}
  ): PlatePlugin<NoInfer<OP>, OV, OE> => {
    overrideByKey[defaultPlugin.key] = override as any;

    return overridePluginsByKey<OP, OV, OE>(
      { ...defaultPlugin } as any,
      overrideByKey
    );
  };
