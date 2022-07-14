import React, { ReactElement, ReactNode } from 'react';
import { Editable } from 'slate-react';
import { TEditableProps, Value } from '../../slate/index';
import { PlateEditor } from '../../types/index';
import { EditorRefEffect } from './EditorRefEffect';
import { EditorStateEffect } from './EditorStateEffect';
import { PlateProps } from './Plate';

export const SlateChildren = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  children,
  renderEditable,
  editableRef,
  editableProps,
  editor,
  firstChildren,
}: Pick<
  PlateProps<V, E>,
  'children' | 'renderEditable' | 'editableRef' | 'firstChildren'
> & {
  editor: E;
  editableProps?: TEditableProps;
}) => {
  const { plugins } = editor;

  const editable = <Editable ref={editableRef} {...(editableProps as any)} />;

  let afterEditable: ReactNode = null;
  let beforeEditable: ReactNode = null;

  plugins.forEach((plugin) => {
    const { renderBeforeEditable, renderAfterEditable } = plugin;

    if (renderAfterEditable) {
      afterEditable = (
        <>
          {afterEditable}
          {renderAfterEditable()}
        </>
      );
    }

    if (renderBeforeEditable) {
      beforeEditable = (
        <>
          {beforeEditable}
          {renderBeforeEditable()}
        </>
      );
    }
  });

  let aboveEditable: ReactElement | null = (
    <>
      {firstChildren}

      {beforeEditable}

      {renderEditable ? renderEditable(editable) : editable}

      <EditorStateEffect id={editor.id} />
      <EditorRefEffect id={editor.id} />

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
