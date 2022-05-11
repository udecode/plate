import { memo, useEffect } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { Value } from '../slate/editor/TEditor';
import { getPlateActions } from '../stores/plate/platesStore';
import { PlateProps } from './Plate';

export const EditorStateEffect = memo(
  ({ id }: Pick<PlateProps<Value>, 'id'>) => {
    const editorState = useEditorState();

    useEffect(() => {
      getPlateActions(id).incrementKey('keyEditor');
    });

    useEffect(() => {
      getPlateActions(id).incrementKey('keySelection');
    }, [editorState.selection, id]);

    return null;
  }
);
