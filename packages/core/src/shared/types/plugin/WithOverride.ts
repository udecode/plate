import type { PlateEditor } from '../PlateEditor';
import type { PlatePlugin } from './PlatePlugin';

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type WithOverride<O = {}, T = {}, Q = {}, S = {}> = (
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
) => PlateEditor;
