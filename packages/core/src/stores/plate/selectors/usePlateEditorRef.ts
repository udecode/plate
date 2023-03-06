import { Value } from '@udecode/slate';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { PlateId, usePlateSelectors } from '../createPlateStore';

/**
 * Get editor ref which is never updated.
 */
export const usePlateEditorRef = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
) => usePlateSelectors<V, E>(id).editor();
