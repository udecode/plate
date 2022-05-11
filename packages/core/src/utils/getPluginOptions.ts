import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getPlugin } from './getPlugin';

export const getPluginOptions = <
  P,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  key: PluginKey
): P => getPlugin<P, V, E>(editor, key).options ?? ({} as P);
