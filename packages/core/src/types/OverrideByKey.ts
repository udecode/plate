import { Value } from '../slate/editor/TEditor';
import { PlatePlugin } from './plugins/PlatePlugin';
import { PluginKey } from './plugins/PlatePluginKey';
import { PlateEditor } from './PlateEditor';

export type OverrideByKey<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Record<PluginKey, Partial<PlatePlugin<{}, V, E>>>;
