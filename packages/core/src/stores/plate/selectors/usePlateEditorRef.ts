import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { getPlateSelectors, usePlateSelectors } from '../platesStore';

export const getPlateEditorRef = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => getPlateSelectors<V, E>(id).editor();

/**
 * Get editor ref which is never updated.
 */
export const usePlateEditorRef = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => usePlateSelectors<V, E>(id).editor();
