import React from 'react';

import { defineEditorExtension } from '@platejs/slate';

import { isPlateRuntimeEditor } from '../editor/createPlateRuntimeEditor';
import { useEditorRef, useRedecorate } from '../stores';

export const EditorMethodsEffect = ({ id }: { id?: string }) => {
  const editor = useEditorRef(id);
  const redecorate = useRedecorate(id);

  React.useEffect(() => {
    if (isPlateRuntimeEditor(editor)) {
      return editor.extend(
        defineEditorExtension({
          api: { redecorate },
          name: 'plate:redecorate',
        })
      );
    }

    editor.api.redecorate = redecorate;
  }, [editor, redecorate]);

  return null;
};
