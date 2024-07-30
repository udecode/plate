import type { PlateEditor } from '../PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

export type PlatePluginUseHooks<O = {}, T = {}, Q = {}, S = {}> = (
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
) => void;
