import React, { forwardRef } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { EElement, TEditor, Value } from '@udecode/plate-common';
import {
  DraggableBlock,
  DraggableBlockToolbar,
  DraggableBlockToolbarWrapper,
  DraggableDropline,
  DraggableGutterLeft,
  DraggableRoot,
  DragHandle as DefaultDragHandle,
  DragItemNode,
  useDraggableState,
} from '@udecode/plate-dnd';
import { PlateElementProps } from '@udecode/plate-styled-components';
import { getDraggableStyles } from './PlateDraggable.styles';
import { DraggableStyles, DragHandleProps } from './PlateDraggable.types';

export interface PlateDraggableProps
  extends PlateElementProps<Value, EElement<Value>, DraggableStyles> {
  /**
   * An override to render the drag handle.
   */
  onRenderDragHandle?: (props: DragHandleProps) => JSX.Element;
  /**
   * Intercepts the drop handling.
   * If `false` is returned, the default drop behavior is called after.
   * If `true` is returned, the default behavior is not called.
   */
  onDropHandler?: (
    editor: TEditor,
    props: {
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      dragItem: DragItemNode;
      nodeRef: any;
      id: string;
    }
  ) => boolean;
}

export const PlateDraggable = forwardRef<HTMLDivElement, PlateDraggableProps>(
  (props, ref) => {
    const { children, element, onRenderDragHandle } = props;

    const DragHandle = onRenderDragHandle ?? DefaultDragHandle;

    const { dropLine, isDragging, rootRef, dragRef } = useDraggableState(props);

    const styles = getDraggableStyles({
      ...props,
      direction: dropLine,
      isDragging,
    });

    return (
      <DraggableRoot
        css={styles.root.css}
        className={styles.root.className}
        rootRef={rootRef}
        ref={ref}
      >
        <DraggableGutterLeft
          css={[
            ...(styles.blockAndGutter?.css ?? []),
            ...(styles.gutterLeft?.css ?? []),
          ]}
          className={styles.gutterLeft?.className}
        >
          <DraggableBlockToolbarWrapper
            css={styles.blockToolbarWrapper?.css}
            className={styles.blockToolbarWrapper?.className}
          >
            <DraggableBlockToolbar
              dragRef={dragRef}
              element={element}
              css={styles.blockToolbar?.css}
              className={styles.blockToolbar?.className}
            >
              <DragHandle
                element={element}
                styles={styles.dragHandle?.css}
                className={styles.dragHandle?.className}
              />
            </DraggableBlockToolbar>
          </DraggableBlockToolbarWrapper>
        </DraggableGutterLeft>

        <DraggableBlock
          css={[
            ...(styles.blockAndGutter?.css ?? []),
            ...(styles.block?.css ?? []),
          ]}
        >
          {children}

          {!!dropLine && (
            <DraggableDropline
              css={styles.dropLine?.css}
              className={styles.dropLine?.className}
            />
          )}
        </DraggableBlock>
      </DraggableRoot>
    );
  }
);
