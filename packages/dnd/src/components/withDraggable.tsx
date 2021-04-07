import React, { forwardRef, FunctionComponent, useMemo } from 'react';
import {
  SPRenderElementProps,
  TEditor,
  TRenderElementProps,
  useTSlateStatic,
} from '@udecode/slate-plugins-core';
import { Path } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { Draggable } from './Draggable';
import { DraggableProps } from './Draggable.types';

export interface WithDraggableOptions
  extends Pick<DraggableProps, 'dragIcon' | 'styles'> {
  level?: number;
  filter?: (editor: TEditor, path: Path) => boolean;
  allowReadOnly?: boolean;
}

export const withDraggable = (
  Component: FunctionComponent<TRenderElementProps>,
  {
    styles,
    level,
    filter,
    allowReadOnly = false,
    dragIcon,
  }: WithDraggableOptions = {}
) =>
  forwardRef((props: SPRenderElementProps, ref) => {
    const { attributes, element } = props;
    const editor = useTSlateStatic();
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
        attributes={attributes}
        element={element}
        componentRef={ref}
        styles={styles}
        dragIcon={dragIcon}
      >
        <Component {...props} />
      </Draggable>
    );
  });
