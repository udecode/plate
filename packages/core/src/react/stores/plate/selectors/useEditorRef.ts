import type { PlateEditor } from '../../../../lib';

import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get editor ref which is never updated. */
export const useEditorRef = <E extends PlateEditor = PlateEditor>(
  id?: string,
  options: UsePlateEditorStoreOptions = {}
): E =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorRef',
    ...options,
  }).editor() as any;
