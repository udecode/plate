import type { PlateEditor } from '../types/PlateEditor';

import { getPlugin } from './getPlugin';

/** Get plugin type option by plugin key. */
export const getPluginType = (editor: PlateEditor, key: string): string =>
  getPlugin(editor, key).type ?? key ?? '';
