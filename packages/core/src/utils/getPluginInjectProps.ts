import { PlateEditor } from '../types/PlateEditor';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getPlugin } from './getPlugin';

export const getPluginInjectProps = <T = {}>(
  editor: PlateEditor<T>,
  key: PluginKey
) => getPlugin<{}, T>(editor, key).inject?.props ?? {};
