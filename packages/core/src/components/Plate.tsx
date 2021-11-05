import React from 'react';
import { Editable, Slate } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { usePlate } from '../hooks/usePlate/usePlate';
import { SlateProps } from '../types/SlateProps';
import { UsePlateEffectsOptions } from '../types/UsePlateEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';
import { EditorStateEffect } from './EditorStateEffect';

export interface PlateProps<T = {}>
  extends UsePlateEffectsOptions<T>,
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

export const Plate = <T,>({
  children,
  renderEditable,
  ...options
}: PlateProps<T>) => {
  const { slateProps, editableProps } = usePlate(options);

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
