import { PlateEditor } from '../PlateEditor';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
) => PlateEditor<T>;
