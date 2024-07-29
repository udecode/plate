import type { PlateEditor } from '../types/PlateEditor';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { getPlugin } from './getPlugin';

export const getPluginOptions = <P>(editor: PlateEditor, key: PluginKey): P =>
  getPlugin<P>(editor, key).options ?? ({} as P);
