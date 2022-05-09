import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../PlateEditor';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<V extends Value = Value, T = {}, P = {}> = (
  editor: PlateEditor<V, T>,
  plugin: WithPlatePlugin<V, T, P>
) => PlateEditor<V, T>;
