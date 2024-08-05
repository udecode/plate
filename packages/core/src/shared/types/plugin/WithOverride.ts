import type { PlateEditor } from '../PlateEditor';
import type { PlatePluginContext } from './PlatePlugin';

/** Plate plugin overriding the `editor` methods. Naming convention is `with*`. */
export type WithOverride<O = {}, A = {}, T = {}, S = {}> = (
  ctx: PlatePluginContext<string, O, A, T, S>
) => PlateEditor;
