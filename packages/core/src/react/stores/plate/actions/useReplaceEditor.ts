import React from 'react';

import { createPlateEditor } from '../../../editor';
import {
  type UsePlateEditorStoreOptions,
  usePlateActions,
} from '../createPlateStore';
import { useEditorRef } from '../selectors';

/** Replace plate editor with the same id and plugins. Remounts `PlateContent`. */
export const useReplaceEditor = (
  id?: string,
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
      plugins: editor.pluginList as any,
    });

    setEditor(newEditor);
  }, [editor, setEditor]);
};
