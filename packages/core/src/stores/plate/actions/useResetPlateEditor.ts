import { useCallback } from 'react';

import { createPlateEditor } from '../../../utils/index';
import {
  PlateId,
  usePlateActions,
  usePlateSelectors,
} from '../createPlateStore';

/**
 * Set a new editor with plate.
 */
export const useResetPlateEditor = (id?: PlateId) => {
  const editor = usePlateSelectors(id).editor();
  const setEditor = usePlateActions(id).editor();

  return useCallback(() => {
    const newEditor = createPlateEditor({
      id: editor.id,
      plugins: editor.plugins,
      // disable core plugins as it's already included
      disableCorePlugins: true,
    });

    setEditor(newEditor);
  }, [editor, setEditor]);
};
