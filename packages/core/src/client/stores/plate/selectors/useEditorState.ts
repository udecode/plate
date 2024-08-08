import type { PlateEditor } from '../../../../shared/types';

import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get editor state which is updated on editor change. */
export const useEditorState = <E extends PlateEditor = PlateEditor>(
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
): E => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorState',
    ...options,
  }).trackedEditor().editor;
};
