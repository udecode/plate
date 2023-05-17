import React, { forwardRef } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { TEditor } from '@udecode/plate-common';
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
import { cn, PlateElementProps } from '@udecode/plate-styled-components';
import { DragHandleProps } from './PlateDraggable.types';

export interface PlateDraggableProps extends PlateElementProps {
  classNameBlockAndGutter?: string;

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
  ({ classNameBlockAndGutter, ...props }, ref) => {
    const { children, element, onRenderDragHandle } = props;

    const DragHandle = onRenderDragHandle ?? DefaultDragHandle;

    const { dropLine, isDragging, rootRef, dragRef } = useDraggableState(props);

    return (
      <DraggableRoot
        className={cn(
          'relative',
          isDragging && 'opacity-50',
          'hover:[&_.slate-Draggable-gutterLeft]:opacity-100'
          // selected && 'bg-[rgb(181, 215, 255)]',
        )}
        rootRef={rootRef}
        ref={ref}
      >
        <DraggableGutterLeft
          className={cn(
            'pointer-events-none absolute top-0 flex h-full -translate-x-full cursor-text opacity-0',
            classNameBlockAndGutter
          )}
        >
          <DraggableBlockToolbarWrapper className="flex h-[1.5em]">
            <DraggableBlockToolbar
              dragRef={dragRef}
              element={element}
              className="pointer-events-auto mr-1 flex items-center"
            >
              <DragHandle
                element={element}
                className="h-[18px] min-w-[18px] cursor-pointer overflow-hidden border-none bg-transparent bg-no-repeat p-0 outline-none"
              />
            </DraggableBlockToolbar>
          </DraggableBlockToolbarWrapper>
        </DraggableGutterLeft>

        <DraggableBlock
          className={cn('overflow-auto', classNameBlockAndGutter)}
        >
          {children}

          {!!dropLine && (
            <DraggableDropline
              className={cn(
                'absolute left-0 right-0 h-0.5 opacity-100',
                'bg-[#B4D5FF]',
                dropLine === 'top' && '-top-px',
                dropLine === 'bottom' && '-bottom-px'
              )}
            />
          )}
        </DraggableBlock>
      </DraggableRoot>
    );
  }
);
