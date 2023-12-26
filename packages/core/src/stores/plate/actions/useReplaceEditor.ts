import React from 'react';

import { createPlateEditor } from '../../../utils/index';
import { PlateId, usePlateActions } from '../createPlateStore';
import { useEditorRef } from '../selectors/index';

/**
 * Replace plate editor with the same id and plugins.
 * Remounts `PlateContent`.
 */
export const useReplaceEditor = (id?: PlateId) => {
  const editor = useEditorRef(id);
  const setEditor = usePlateActions(id).editor();

  return React.useCallback(() => {
    const newEditor = createPlateEditor({
      id: editor.id,
      plugins: editor.plugins,
      // disable core plugins as it's already included
      disableCorePlugins: true,
    });

    setEditor(newEditor);
  }, [editor, setEditor]);
};
