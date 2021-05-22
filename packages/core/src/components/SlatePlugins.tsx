import React from 'react';
import { Editable, Slate } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { useSlatePlugins } from '../hooks/useSlatePlugins/useSlatePlugins';
import { SlateProps } from '../types/SlateProps';
import { SPEditor } from '../types/SPEditor';
import { UseSlatePluginsEffectsOptions } from '../types/UseSlatePluginsEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';
import { EditorStateEffect } from './EditorStateEffect';

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

  /**
   * Custom `Editable` node.
   */
  renderEditable?: (editable: React.ReactNode) => React.ReactNode;
}

export const SlatePlugins = <T extends SPEditor = SPEditor>({
  children,
  renderEditable,
  ...options
}: SlatePluginsProps<T>) => {
  const { slateProps, editableProps } = useSlatePlugins(options);

  if (!slateProps.editor) return null;

  const editable = <Editable {...editableProps} />;

  return (
    <Slate {...(slateProps as SlateProps)}>
      {children}
      <EditorStateEffect id={options.id} />
      {renderEditable ? renderEditable(editable) : editable}
    </Slate>
  );
};
