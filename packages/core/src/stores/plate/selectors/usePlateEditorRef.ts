import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { getPlateSelectors, usePlateSelectors } from '../platesStore';

export const getPlateEditorRef = <V extends Value = Value, T = {}>(
  id?: string
) => getPlateSelectors(id).editor() as PlateEditor<V, T>;

/**
 * Get editor ref which is never updated.
 */
export const usePlateEditorRef = <V extends Value = Value, T = {}>(
  id?: string
) => usePlateSelectors(id).editor() as PlateEditor<V, T>;
