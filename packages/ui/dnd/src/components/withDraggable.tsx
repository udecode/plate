import React, { forwardRef, useMemo } from 'react';
import {
  createNodesWithHOC,
  findNodePath,
  PlateRenderElementProps,
  Value,
} from '@udecode/plate-core';
import { useReadOnly } from 'slate-react';
import { DraggableProps } from './Draggable.types';
import { PlateDraggable } from './PlateDraggable';

export interface WithDraggableOptions<V extends Value = Value>
  extends Pick<
    DraggableProps<V>,
    'onRenderDragHandle' | 'styles' | 'level' | 'filter' | 'allowReadOnly'
  > {}

export const withDraggable = <V extends Value>(
  Component: any,
  {
    styles,
    level = 0,
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
      <PlateDraggable
        editor={editor}
        attributes={attributes}
        element={element}
        componentRef={ref}
        styles={styles}
        onRenderDragHandle={onRenderDragHandle}
      >
        <Component {...props} />
      </PlateDraggable>
    );
  });
};

export const withDraggables = createNodesWithHOC(withDraggable);
