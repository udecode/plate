import { PlateEditor } from '../../PlateEditor';
import { PlatePlugin } from './PlatePlugin';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: PlatePlugin<T, P>
) => PlateEditor<T>;
