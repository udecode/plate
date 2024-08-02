import type { PlateEditor } from '../types/PlateEditor';
import type { PlatePlugin } from '../types/plugin/PlatePlugin';
import type { PluginKey } from '../types/plugin/PlatePluginKey';

import { createPlugin } from './createPlugin';

/** Get plugin options by plugin key. */
export const getPlugin = <O = {}, T = {}, Q = {}, S = {}>(
  editor: PlateEditor,
  key: PluginKey
) =>
  ((editor.pluginsByKey?.[key] as any) ?? createPlugin({ key })) as PlatePlugin<
    O,
    T,
    Q,
    S
  >;
