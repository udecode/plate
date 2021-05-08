import { memo, useEffect } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { useSlatePluginsActions } from '../stores/slate-plugins/slate-plugins.actions';
import { SlatePluginsProps } from './SlatePlugins';

export const EditorStateEffect = memo(
  ({ id }: Pick<SlatePluginsProps, 'id'>) => {
    const { setSelection, incrementKeyChange } = useSlatePluginsActions(id);
    const editorState = useEditorState();

    useEffect(() => {
      incrementKeyChange();
    });

    useEffect(() => {
      setSelection(editorState.selection ? { ...editorState.selection } : null);
    }, [editorState.selection, setSelection]);

    return null;
  }
);
