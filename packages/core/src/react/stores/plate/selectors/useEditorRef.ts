import type { PlateEditor } from '../../../editor/PlateEditor';

import { createPlateFallbackEditor } from '../../../utils';
import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get editor ref which is never updated. */
export const useEditorRef = <E extends PlateEditor = PlateEditor>(
  id?: string,
  options: UsePlateEditorStoreOptions = {}
): E => {
  return (
    (usePlateSelectors(id, {
      debugHookName: 'useEditorRef',
      ...options,
    }).editor() as E) ?? createPlateFallbackEditor()
  );
};
