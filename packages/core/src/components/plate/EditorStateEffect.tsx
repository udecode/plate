import { memo, useEffect } from 'react';
import { useEditorState } from '../../hooks/slate/useEditorState';
import { getPlateActions } from '../../stores/plate/platesStore';
import { PlateProps } from './Plate';

export const EditorStateEffect = memo(({ id }: Pick<PlateProps, 'id'>) => {
  const editorState = useEditorState();

  useEffect(() => {
    getPlateActions(id).incrementKey('keyEditor');
  });

  useEffect(() => {
    getPlateActions(id).incrementKey('keySelection');
  }, [editorState.selection, id]);

  return null;
});
