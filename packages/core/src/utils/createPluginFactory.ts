import { NoInfer } from '../common/types/utility/NoInfer';
import { Value } from '../slate/editor/TEditor';
import { OverrideByKey } from '../types/OverrideByKey';
import { PlateEditor } from '../types/PlateEditor';
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
  defaultPlugin: PlatePlugin<NoInfer<P>, Value, PlateEditor>
) => <V extends Value, E extends PlateEditor<V> = PlateEditor<V>>(
  override?: Partial<PlatePlugin<NoInfer<P>, V, E>>,
  overrideByKey: OverrideByKey<V, E> = {}
): PlatePlugin<NoInfer<P>, V, E> => {
  overrideByKey[defaultPlugin.key] = override as any;

  return overridePluginsByKey<P, V, E>(
    { ...defaultPlugin } as any,
    overrideByKey
  );
};
