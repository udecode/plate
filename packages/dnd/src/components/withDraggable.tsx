import React, { forwardRef, useMemo } from 'react';
import { createNodesWithHOC } from '@udecode/slate-plugins-common';
import {
  SPRenderElementProps,
  TEditor,
  useTSlateStatic,
} from '@udecode/slate-plugins-core';
import { Path } from 'slate';
import { ReactEditor, useReadOnly } from 'slate-react';
import { Draggable } from './Draggable';
import { DraggableProps } from './Draggable.types';

export interface WithDraggableOptions
  extends Pick<DraggableProps, 'buttonRender' | 'styles'> {
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
    buttonRender,
  }: WithDraggableOptions = {}
) => {
  return forwardRef((props: SPRenderElementProps, ref) => {
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
        buttonRender={buttonRender}
      >
        <Component {...props} />
      </Draggable>
    );
  });
};

export const withDraggables = createNodesWithHOC(withDraggable);
