import type { PlateEditor } from '../types/PlateEditor';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { getPlugin } from './getPlugin';

export const getPluginInjectProps = (editor: PlateEditor, key: PluginKey) =>
  getPlugin(editor, key).inject?.props ?? {};
