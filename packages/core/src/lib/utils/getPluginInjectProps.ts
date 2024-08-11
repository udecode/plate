import type { PlateEditor } from '../editor';
import type { PluginKey } from '../plugin/types/PlatePlugin';

import { getPlugin } from '../plugin/getPlugin';

export const getPluginInjectProps = (editor: PlateEditor, key: PluginKey) =>
  getPlugin(editor, key).inject?.props ?? {};
