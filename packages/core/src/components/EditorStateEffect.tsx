/* eslint-disable react/display-name */
import { memo, useEffect } from 'react';

import { useEditorState } from '../hooks/useEditorState';
import { PlateId, useUpdatePlateKey } from '../stores';

export const EditorStateEffect = memo(({ id }: { id?: PlateId }) => {
  const editorState = useEditorState();
  const updateKeyEditor = useUpdatePlateKey('keyEditor', id);
  const updateKeySelection = useUpdatePlateKey('keySelection', id);

  useEffect(() => {
    updateKeyEditor();
  });

  console.log('a');

  useEffect(() => {
    updateKeySelection();
  }, [editorState.selection, updateKeySelection]);

  return null;
});
