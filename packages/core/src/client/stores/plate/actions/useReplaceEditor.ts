import React from 'react';

import { createPlateEditor } from '../../../utils';
import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  usePlateActions,
} from '../createPlateStore';
import { useEditorRef } from '../selectors';

/** Replace plate editor with the same id and plugins. Remounts `PlateContent`. */
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
      // disable core plugins as it's already included
      disableCorePlugins: true,
      id: editor.id,
      plugins: editor.plugins,
    });

    setEditor(newEditor);
  }, [editor, setEditor]);
};
