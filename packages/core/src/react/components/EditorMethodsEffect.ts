import React from 'react';

import { useEditorRef, useRedecorate } from '../stores';

export const EditorMethodsEffect = ({ id }: { id?: string }) => {
  const editor = useEditorRef(id);
  const redecorate = useRedecorate(id);

  React.useEffect(() => {
    editor.api.redecorate = redecorate;
  }, [editor, redecorate]);

  return null;
};
