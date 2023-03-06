import { Value } from '@udecode/slate';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PluginKey } from '../../types/plugin/PlatePluginKey';
import { getPlugin } from './getPlugin';

export const getPluginOptions = <
  P,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  key: PluginKey
): P => getPlugin<P, V, E>(editor, key).options ?? ({} as P);
