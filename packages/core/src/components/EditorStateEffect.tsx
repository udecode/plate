import { memo, useEffect } from 'react';
import { Editor } from 'slate';
import { useEditorRef } from '../hooks';
import { useEditorState } from '../hooks/useEditorState';
import { usePlateActions } from '../stores/plate/plate.actions';
import { PlateProps } from './Plate';

export const EditorStateEffect = memo(
  ({
    id,
    normalizeInitialValue,
  }: Pick<PlateProps, 'id' | 'normalizeInitialValue'>) => {
    const { setSelection, incrementKeyChange } = usePlateActions(id);
    const editorState = useEditorState();
    const editor = useEditorRef();

    useEffect(() => {
      incrementKeyChange();
    });

    useEffect(() => {
      setSelection(editorState.selection ? { ...editorState.selection } : null);
    }, [editorState.selection, setSelection]);

    useEffect(() => {
      if (editor && normalizeInitialValue) {
        Editor.normalize(editor, { force: true });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    return null;
  }
);
