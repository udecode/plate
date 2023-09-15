/* eslint-disable react/display-name */
import { memo, useEffect } from 'react';
import { useSlate } from 'slate-react';

import { PlateId, useUpdatePlateKey } from '../stores';

export const EditorStateEffect = memo(({ id }: { id?: PlateId }) => {
  const editorState = useSlate();
  const updateKeyEditor = useUpdatePlateKey('keyEditor', id);
  const updateKeySelection = useUpdatePlateKey('keySelection', id);

  useEffect(() => {
    updateKeyEditor();
  });

  useEffect(() => {
    updateKeySelection();
  }, [editorState.selection, updateKeySelection]);

  return null;
});
