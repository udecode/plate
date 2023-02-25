import React, { forwardRef, useMemo } from 'react';
import {
  createNodesWithHOC,
  findNodePath,
  PlateRenderElementProps,
} from '@udecode/plate-core';
import { useReadOnly } from 'slate-react';
import { PlateDraggableProps } from './Draggable.types';
import { PlateDraggable } from './PlateDraggable';

export interface WithDraggableOptions
  extends Pick<
    PlateDraggableProps,
    'onRenderDragHandle' | 'styles' | 'level' | 'filter' | 'allowReadOnly'
  > {}

export const withDraggable = (
  Component: any,
  {
    styles,
    level = 0,
    filter,
    allowReadOnly = false,
    onRenderDragHandle,
  }: WithDraggableOptions = {}
) => {
  return forwardRef<HTMLDivElement, PlateRenderElementProps>((props, ref) => {
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
        ref={ref}
        styles={styles}
        onRenderDragHandle={onRenderDragHandle}
      >
        <Component {...props} />
      </PlateDraggable>
    );
  });
};

export const withDraggables = createNodesWithHOC(withDraggable);
