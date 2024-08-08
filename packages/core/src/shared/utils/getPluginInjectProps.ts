import type { PluginKey } from '../types';
import type { PlateEditor } from '../types/PlateEditor';

import { getPlugin } from './getPlugin';

export const getPluginInjectProps = (editor: PlateEditor, key: PluginKey) =>
  getPlugin(editor, key).inject?.props ?? {};
