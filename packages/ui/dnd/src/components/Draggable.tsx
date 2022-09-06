import React, { useRef } from 'react';
import useMergedRef from '@react-hook/merged-ref';
import { Value } from '@udecode/plate-core';
import { useDndBlock } from '../hooks/useDndBlock';
import { getDraggableStyles } from './Draggable.styles';
import { DraggableProps, DragHandleProps } from './Draggable.types';

const DefaultDragHandle = ({ styles, ...props }: DragHandleProps) => (
  <button type="button" {...props} css={styles} />
);

export const Draggable = <V extends Value>(props: DraggableProps<V>) => {
  const { children, element, componentRef, onRenderDragHandle } = props;

  const DragHandle = onRenderDragHandle ?? DefaultDragHandle;

  const blockRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragWrapperRef = useRef(null);
  const multiRootRef = useMergedRef(componentRef, rootRef);

  const { dropLine, dragRef, isDragging } = useDndBlock({
    id: element.id as string,
    nodeRef: rootRef,
  });

  const multiDragRef = useMergedRef(dragRef, dragWrapperRef);

  const styles = getDraggableStyles({
    ...props,
    direction: dropLine,
    isDragging,
  });

  return (
    <div
      css={styles.root.css}
      className={styles.root.className}
      ref={multiRootRef}
    >
      <div
        css={[
          ...(styles.blockAndGutter?.css ?? []),
          ...(styles.gutterLeft?.css ?? []),
        ]}
        className={styles.gutterLeft?.className}
        contentEditable={false}
      >
        <div
          css={styles.blockToolbarWrapper?.css}
          className={styles.blockToolbarWrapper?.className}
        >
          <div
            css={styles.blockToolbar?.css}
            className={styles.blockToolbar?.className}
            ref={multiDragRef}
          >
            <DragHandle
              element={element}
              styles={styles.dragHandle?.css}
              className={styles.dragHandle?.className}
              onMouseDown={(e: any) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>

      <div
        ref={blockRef}
        css={[
          ...(styles.blockAndGutter?.css ?? []),
          ...(styles.block?.css ?? []),
        ]}
      >
        {children}

        {!!dropLine && (
          <div
            css={styles.dropLine?.css}
            className={styles.dropLine?.className}
            contentEditable={false}
          />
        )}
      </div>
    </div>
  );
};
