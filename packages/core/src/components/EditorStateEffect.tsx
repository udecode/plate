import { memo, useEffect } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { usePlateActions } from '../stores/plate/plate.actions';
import { PlateProps } from './Plate';

export const EditorStateEffect = memo(({ id }: Pick<PlateProps, 'id'>) => {
  const { setSelection, incrementKeyChange } = usePlateActions(id);
  const editorState = useEditorState();

  useEffect(() => {
    incrementKeyChange();
  });

  useEffect(() => {
    setSelection(editorState.selection ? { ...editorState.selection } : null);
  }, [editorState.selection, setSelection]);

  return null;
});
