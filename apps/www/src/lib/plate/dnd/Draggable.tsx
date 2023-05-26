import React, { forwardRef } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { ClassNames, TEditor, TElement } from '@udecode/plate-common';
import {
  DraggableBlock,
  DraggableBlockToolbar,
  DraggableBlockToolbarWrapper,
  DraggableDropline,
  DraggableGutterLeft,
  DraggableRoot,
  DragItemNode,
  useDraggableState,
} from '@udecode/plate-dnd';
import { cn, PlateElementProps } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface DragHandleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  element: TElement;
}

export interface PlateDraggableProps
  extends PlateElementProps,
    ClassNames<{
      /**
       * Block and gutter.
       */
      blockAndGutter: string;

      /**
       * Block.
       */
      block: string;

      /**
       * Gutter at the left side of the editor.
       * It has the height of the block
       */
      gutterLeft: string;

      /**
       * Block toolbar wrapper in the gutter left.
       * It has the height of a line of the block.
       */
      blockToolbarWrapper: string;

      /**
       * Block toolbar in the gutter.
       */
      blockToolbar: string;

      blockWrapper: string;

      /**
       * Button to dnd the block, in the block toolbar.
       */
      dragHandle: string;

      /**
       * Icon of the drag button, in the drag icon.
       */
      dragIcon: string;

      /**
       * Show a dropline above or below the block when dragging a block.
       */
      dropLine: string;
    }> {
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

export const Draggable = forwardRef<HTMLDivElement, PlateDraggableProps>(
  ({ className, classNames = {}, ...props }, ref) => {
    const { children, element } = props;

    const { dropLine, isDragging, rootRef, dragRef } = useDraggableState(props);

    return (
      <DraggableRoot
        className={cn(
          'relative',
          isDragging && 'opacity-50',
          'group',
          className
          // selected && 'bg-[rgb(181, 215, 255)]',
        )}
        rootRef={rootRef}
        ref={ref}
      >
        <DraggableGutterLeft
          className={cn(
            'pointer-events-none absolute top-0 flex h-full -translate-x-full cursor-text opacity-0 group-hover:opacity-100',
            classNames.gutterLeft
          )}
        >
          <DraggableBlockToolbarWrapper
            className={cn('flex h-[1.5em]', classNames.blockToolbarWrapper)}
          >
            <DraggableBlockToolbar
              dragRef={dragRef}
              element={element}
              className={cn(
                'pointer-events-auto mr-1 flex items-center',
                classNames.blockToolbar
              )}
            >
              <Tooltip>
                <TooltipTrigger>
                  {/* className="min-h-[18px] min-w-[18px] cursor-pointer overflow-hidden border-none bg-transparent bg-no-repeat p-0 outline-none" */}
                  <Icons.dragHandle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Drag to move</TooltipContent>
              </Tooltip>
            </DraggableBlockToolbar>
          </DraggableBlockToolbarWrapper>
        </DraggableGutterLeft>

        <DraggableBlock
          className={cn('overflow-auto', classNames.blockWrapper)}
        >
          {children}

          {!!dropLine && (
            <DraggableDropline
              className={cn(
                'absolute inset-x-0 h-0.5 opacity-100',
                'bg-[#B4D5FF]',
                dropLine === 'top' && '-top-px',
                dropLine === 'bottom' && '-bottom-px',
                classNames.dropLine
              )}
            />
          )}
        </DraggableBlock>
      </DraggableRoot>
    );
  }
);
