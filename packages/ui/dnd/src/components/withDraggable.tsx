import React, { forwardRef, useMemo } from 'react';
import {
  createNodesWithHOC,
  findNodePath,
  PlateRenderElementProps,
  TEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';
import { Draggable } from './Draggable';
import { DraggableProps } from './Draggable.types';

export interface WithDraggableOptions<V extends Value = Value>
  extends Pick<DraggableProps<V>, 'onRenderDragHandle' | 'styles'> {
  level?: number;
  filter?: (editor: TEditor<V>, path: Path) => boolean;
  allowReadOnly?: boolean;
}

export const withDraggable = <V extends Value>(
  Component: any,
  {
    styles,
    level,
    filter,
    allowReadOnly = false,
    onRenderDragHandle,
  }: WithDraggableOptions<V> = {}
) => {
  return forwardRef((props: PlateRenderElementProps<V>, ref) => {
    const { attributes, element, editor } = props;
    const readOnly = useReadOnly();
    const path = useMemo(() => findNodePath(editor, element), [
      editor,
      element,
    ]);

    const filteredOut = useMemo(
      () =>
        path &&
        ((Number.isInteger(level) && level !== path.length - 1) ||
          (filter && filter(editor, path))),
      [path, editor]
    );

    if (filteredOut || (!allowReadOnly && readOnly)) {
      return <Component {...props} />;
    }

    return (
      <Draggable
        editor={editor}
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
