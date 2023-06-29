'use client';

import React, { forwardRef } from 'react';
import { DropTargetMonitor } from 'react-dnd';
import { ClassNames, PlateElementProps, TEditor } from '@udecode/plate-common';
import {
  DragItemNode,
  useDraggable,
  useDraggableState,
} from '@udecode/plate-dnd';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/default/plate-ui/tooltip';

export interface DraggableProps
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

const Draggable = forwardRef<HTMLDivElement, DraggableProps>(
  ({ className, classNames = {}, onDropHandler, ...props }, ref) => {
    const { children, element } = props;

    const state = useDraggableState({ element, onDropHandler });
    const { dropLine, isDragging } = state;
    const { droplineProps, gutterLeftProps, previewRef, handleRef } =
      useDraggable(state);

    return (
      <div
        className={cn(
          'relative',
          isDragging && 'opacity-50',
          'group',
          className
        )}
        ref={ref}
      >
        <div
          className={cn(
            'pointer-events-none absolute top-0 flex h-full -translate-x-full cursor-text opacity-0 group-hover:opacity-100',
            classNames.gutterLeft
          )}
          {...gutterLeftProps}
        >
          <div className={cn('flex h-[1.5em]', classNames.blockToolbarWrapper)}>
            <div
              className={cn(
                'pointer-events-auto mr-1 flex items-center',
                classNames.blockToolbar
              )}
            >
              <Tooltip>
                <TooltipTrigger ref={handleRef}>
                  <Icons.dragHandle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>Drag to move</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className={cn('', classNames.blockWrapper)} ref={previewRef}>
          {children}

          {!!dropLine && (
            <div
              className={cn(
                'absolute inset-x-0 h-0.5 opacity-100',
                'bg-ring',
                dropLine === 'top' && '-top-px',
                dropLine === 'bottom' && '-bottom-px',
                classNames.dropLine
              )}
              {...droplineProps}
            />
          )}
        </div>
      </div>
    );
  }
);
Draggable.displayName = 'Draggable';

export { Draggable };
