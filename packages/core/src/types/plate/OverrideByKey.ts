import { Value } from '@udecode/slate';
import { PlatePlugin } from '../plugin/PlatePlugin';
import { PluginKey } from '../plugin/PlatePluginKey';
import { PlateEditor } from './PlateEditor';

export type OverrideByKey<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = Record<PluginKey, Partial<PlatePlugin<{}, V, E>>>;
