import React from 'react';

import { createPlateEditor } from '../../../utils';
import {
  PlateId,
  usePlateActions,
  UsePlateEditorStoreOptions,
} from '../createPlateStore';
import { useEditorRef } from '../selectors';

/**
 * Replace plate editor with the same id and plugins.
 * Remounts `PlateContent`.
 */
export const useReplaceEditor = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) => {
  const editor = useEditorRef(id, {
    debugHookName: 'useReplaceEditor',
    ...options,
  });

  const setEditor = usePlateActions(id, {
    debugHookName: 'useReplaceEditor',
    ...options,
  }).editor();

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
