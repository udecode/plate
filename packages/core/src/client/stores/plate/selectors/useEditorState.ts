import { Value } from '@udecode/slate';

import { PlateEditor } from '../../../../shared/types';
import {
  PlateId,
  UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/**
 * Get editor state which is updated on editor change.
 */
export const useEditorState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
): E => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorState',
    ...options,
  }).trackedEditor().editor;
};
