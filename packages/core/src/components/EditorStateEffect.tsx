import { memo, useEffect } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { incrementKey } from '../stores/plate/plate.actions';
import { PlateProps } from './Plate';

export const EditorStateEffect = memo(({ id }: Pick<PlateProps, 'id'>) => {
  const editorState = useEditorState();

  useEffect(() => {
    incrementKey('keyEditor', id);
  });

  useEffect(() => {
    incrementKey('keySelection', id);
  }, [editorState.selection, id]);

  return null;
});
