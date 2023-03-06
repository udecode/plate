import React, { ReactElement, ReactNode, Ref } from 'react';
import { Value } from '@udecode/slate';
import { Editable } from 'slate-react';
import { useEditableProps, useEditorRef } from '../../hooks/index';
import { PlateId } from '../../stores/index';
import { TEditableProps } from '../../types/TEditableProps';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';

export interface PlateEditableExtendedProps {
  id?: PlateId;

  /**
   * The children rendered inside `Slate`, after `Editable`.
   */
  children?: ReactNode;

  /**
   * Ref to the `Editable` component.
   */
  editableRef?: Ref<HTMLDivElement>;

  /**
   * The first children rendered inside `Slate`, before `Editable`.
   * Slate DOM is not yet resolvable on first render, for that case use `children` instead.
   */
  firstChildren?: ReactNode;

  /**
   * Custom `Editable` node.
   */
  renderEditable?: (editable: ReactNode) => ReactNode;
}

export interface PlateEditableProps<V extends Value = Value>
  extends Omit<TEditableProps<V>, 'id'>,
    PlateEditableExtendedProps {}

export const PlateEditable = <V extends Value = Value>({
  children,
  renderEditable,
  editableRef,
  firstChildren,
  ...props
}: PlateEditableProps<V>) => {
  const { id } = props;

  const editor = useEditorRef();
  const { plugins } = editor;

  const editableProps = useEditableProps(props as any);

  const editable = <Editable ref={editableRef} {...(editableProps as any)} />;

  let afterEditable: ReactNode = null;
  let beforeEditable: ReactNode = null;

  plugins.forEach((plugin) => {
    const { renderBeforeEditable, renderAfterEditable } = plugin;

    if (renderAfterEditable) {
      afterEditable = (
        <>
          {afterEditable}
          {renderAfterEditable(editableProps)}
        </>
      );
    }

    if (renderBeforeEditable) {
      beforeEditable = (
        <>
          {beforeEditable}
          {renderBeforeEditable(editableProps)}
        </>
      );
    }
  });

  let aboveEditable: ReactElement | null = (
    <>
      {firstChildren}

      {beforeEditable}

      {renderEditable ? renderEditable(editable) : editable}

      <EditorStateEffect id={id} />
      <EditorRefEffect id={id} />

      {afterEditable}

      {children}
    </>
  );

  plugins.forEach((plugin) => {
    const { renderAboveEditable } = plugin;

    if (renderAboveEditable)
      aboveEditable = renderAboveEditable({
        children: aboveEditable,
      });
  });

  return aboveEditable;
};
