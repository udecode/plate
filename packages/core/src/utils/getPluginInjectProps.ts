import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { PluginKey } from '../types/plugins/PlatePluginKey';
import { getPlugin } from './getPlugin';

export const getPluginInjectProps = <V extends Value>(
  editor: PlateEditor<V>,
  key: PluginKey
) => getPlugin<{}, V>(editor, key).inject?.props ?? {};
