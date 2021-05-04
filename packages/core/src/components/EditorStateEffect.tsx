import { memo, useEffect } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { useSlatePluginsActions } from '../stores/slate-plugins/slate-plugins.actions';
import { SlatePluginsProps } from './SlatePlugins';

export const EditorStateEffect = memo(
  ({ id }: Pick<SlatePluginsProps, 'id'>) => {
    const { setEditorState, setSelection } = useSlatePluginsActions(id);
    const editorState = useEditorState();

    useEffect(() => {
      editorState.keyChange = editorState.keyChange
        ? editorState.keyChange + 1
        : 1;
      console.log(editorState.selection);
      setEditorState(editorState);
    });

    useEffect(() => {
      setSelection(editorState.selection ? { ...editorState.selection } : null);
    }, [editorState.selection, setSelection]);

    return null;
  }
);
