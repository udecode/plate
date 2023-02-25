import React, { forwardRef } from 'react';
import {
  DraggableBlock,
  DraggableBlockToolbar,
  DraggableBlockToolbarWrapper,
  DraggableDropline,
  DraggableGutterLeft,
  DraggableRoot,
  DragHandle as DefaultDragHandle,
  useDraggableState,
} from '@udecode/plate-dnd';
import { getDraggableStyles } from './Draggable.styles';
import { PlateDraggableProps } from './Draggable.types';

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
