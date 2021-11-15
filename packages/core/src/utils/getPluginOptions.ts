import { PlateEditor } from '../types/PlateEditor';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getPlugin } from './getPlugin';

export const getPluginOptions = <P = {}, T = {}>(
  editor: PlateEditor<T>,
  key: PluginKey
) => getPlugin<P, T>(editor, key).options;
