import { Value } from '@udecode/slate';
import { NoInfer } from '../../../../slate-utils/src/types/misc/NoInfer';
import { OverrideByKey } from '../../types/plate/OverrideByKey';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlatePlugin, PluginOptions } from '../../types/plugin/PlatePlugin';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Create plugin factory with a default plugin.
 * - first param is the default plugin.
 * - the only required property of the default plugin is `key`.
 * - returns a plugin factory:
 *   - first param `override` can be used to (deeply) override the default plugin.
 *   - second param `overrideByKey` can be used to (deeply) override by key a nested plugin (in plugin.plugins).
 */
export const createPluginFactory = <
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  defaultPlugin: PlatePlugin<NoInfer<P>, V, E>
) => <
  OP = P,
  OV extends Value = V,
  OE extends PlateEditor<OV> = PlateEditor<OV>
>(
  override?: Partial<PlatePlugin<NoInfer<OP>, OV, OE>>,
  overrideByKey: OverrideByKey<OV, OE> = {}
): PlatePlugin<NoInfer<OP>, OV, OE> => {
  overrideByKey[defaultPlugin.key] = override as any;

  return overridePluginsByKey<OP, OV, OE>(
    { ...defaultPlugin } as any,
    overrideByKey
  );
};
