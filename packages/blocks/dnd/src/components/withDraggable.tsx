import React, { forwardRef, useMemo } from 'react';
import { createNodesWithHOC } from '@udecode/plate-common';
import { SPRenderElementProps, TEditor } from '@udecode/plate-core';
import { Path } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { Draggable } from './Draggable';
import { DraggableProps } from './Draggable.types';

export interface WithDraggableOptions
  extends Pick<DraggableProps, 'onRenderDragHandle' | 'styles'> {
  level?: number;
  filter?: (editor: TEditor, path: Path) => boolean;
  allowReadOnly?: boolean;
}

export const withDraggable = (
  Component: any,
  {
    styles,
    level,
    filter,
    allowReadOnly = false,
    onRenderDragHandle,
  }: WithDraggableOptions = {}
) => {
  return forwardRef((props: SPRenderElementProps, ref) => {
    const { attributes, element, plugins, editor } = props;
    const readOnly = useReadOnly();
    const path = useMemo(() => ReactEditor.findPath(editor, element), [
      editor,
      element,
    ]);

    const filteredOut = useMemo(
      () =>
        (Number.isInteger(level) && level !== path.length - 1) ||
        (filter && filter(editor, path)),
      [path, editor]
    );

    if (filteredOut || (!allowReadOnly && readOnly)) {
      return <Component {...props} />;
    }

    return (
      <Draggable
        editor={editor}
        plugins={plugins}
        attributes={attributes}
        element={element}
        componentRef={ref}
        styles={styles}
        onRenderDragHandle={onRenderDragHandle}
      >
        <Component {...props} />
      </Draggable>
    );
  });
};

export const withDraggables = createNodesWithHOC(withDraggable);
