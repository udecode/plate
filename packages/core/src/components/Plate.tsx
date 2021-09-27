import React from 'react';
import { Editable, Slate } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { usePlate } from '../hooks/usePlate/usePlate';
import { SlateProps } from '../types/SlateProps';
import { SPEditor } from '../types/SPEditor';
import { UsePlateEffectsOptions } from '../types/UsePlateEffectsOptions';
import { UseSlatePropsOptions } from '../types/UseSlatePropsOptions';
import { EditorStateEffect } from './EditorStateEffect';

export interface PlateProps<T extends SPEditor = SPEditor>
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

  /**
   * Force normalization after initial render
   */
  normalizeInitialValue?: boolean;
}

export const Plate = <T extends SPEditor = SPEditor>({
  children,
  renderEditable,
  normalizeInitialValue,
  ...options
}: PlateProps<T>) => {
  const { slateProps, editableProps } = usePlate(options);

  if (!slateProps.editor) return null;

  const editable = <Editable {...editableProps} />;

  return (
    <Slate {...(slateProps as SlateProps)}>
      {children}
      <EditorStateEffect
        id={options.id}
        normalizeInitialValue={normalizeInitialValue}
      />
      {renderEditable ? renderEditable(editable) : editable}
    </Slate>
  );
};
