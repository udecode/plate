import React, { useEffect } from 'react';
import { Editable, Slate } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { useEditorState } from '../hooks/useEditorState';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { useSlatePluginsActions } from '../store/useSlatePluginsActions';
import { SlateProps } from '../types/SlateProps';
import { SPEditor } from '../types/SPEditor';
import { UseSlatePluginsEffectsOptions } from '../types/UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';

export interface SlatePluginsProps<T extends SPEditor = SPEditor>
  extends UseSlatePluginsEffectsOptions<T>,
    UseSlatePropsOptions {
  /**
   * The children rendered inside `Slate` before the `Editable` component.
   */
  children?: React.ReactNode;

  /**
   * The props for the `Editable` component.
   */
  editableProps?: EditableProps;
}

const EditorStateEffect = ({ id }: Pick<SlatePluginsProps, 'id'>) => {
  const { setEditorState } = useSlatePluginsActions(id);
  const editorState = useEditorState();

  useEffect(() => {
    setEditorState(editorState);
  }, [editorState, setEditorState]);

  return null;
};

export const SlatePlugins = <T extends SPEditor = SPEditor>({
  children,
  ...options
}: SlatePluginsProps<T>) => {
  const { slateProps, editableProps } = useSlatePlugins(options);

  if (!slateProps.editor) return null;

  return (
    <Slate {...(slateProps as SlateProps)}>
      {children}
      <EditorStateEffect />
      <Editable {...editableProps} />
    </Slate>
  );
};
