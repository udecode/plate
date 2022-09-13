import { memo, useEffect } from 'react';
import { useEditorState } from '../../hooks/slate/useEditorState';
import { PlateId, useUpdatePlateKey } from '../../stores/index';

export const EditorStateEffect = memo(({ id }: { id?: PlateId }) => {
  const editorState = useEditorState();
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
