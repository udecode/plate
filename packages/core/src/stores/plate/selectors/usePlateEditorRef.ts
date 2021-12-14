import { PlateEditor } from '../../../types/PlateEditor';
import { getPlateSelectors, usePlateSelectors } from '../platesStore';

export const getPlateEditorRef = <T = {}>(id?: string) =>
  getPlateSelectors(id).editor() as PlateEditor<T>;

/**
 * Get editor ref which is never updated.
 */
export const usePlateEditorRef = <T = {}>(id?: string) =>
  usePlateSelectors(id).editor() as PlateEditor<T>;
