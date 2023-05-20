import {
  createPlateEditor,
  CreatePlateEditorOptions,
  PlateEditor,
  TEditor,
  Value,
} from '@udecode/plate';
import { createPlateUI } from './createPlateUI';

/**
 * Create a plate editor with default UI.
 */
export const createPlateUIEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>
>({ components, ...options }: CreatePlateEditorOptions<V, E> = {}): E &
  PlateEditor<V> =>
  createPlateEditor<V, E>({
    ...options,
    components: createPlateUI(components),
  });
