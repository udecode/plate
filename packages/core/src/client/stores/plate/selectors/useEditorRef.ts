import type { PlateEditor } from '../../../../shared/types';

import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get editor ref which is never updated. */
export const useEditorRef = <E extends PlateEditor = PlateEditor>(
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
): E =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorRef',
    ...options,
  }).editor() as any;
