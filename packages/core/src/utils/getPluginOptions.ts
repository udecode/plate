import { Value } from '../slate/types/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getPlugin } from './getPlugin';

export const getPluginOptions = <V extends Value, P = {}, T = {}>(
  editor: PlateEditor<V, T>,
  key: PluginKey
): P => getPlugin<V, P, T>(editor, key).options ?? ({} as P);
