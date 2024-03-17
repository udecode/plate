'use client';

import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { ClassNames, PlateElementProps, TEditor } from '@udecode/plate-common';
import {
  DragItemNode,
  useDraggable,
  useDraggableState,
} from '@udecode/plate-dnd';
import { DropTargetMonitor } from 'react-dnd';

import { Icons } from '@/components/icons';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

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

const dragHandle = (
  <Tooltip>
    <TooltipTrigger>
      <Icons.dragHandle className="size-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>Drag to move</TooltipContent>
  </Tooltip>
);

export const Draggable = withRef<'div', DraggableProps>(
  ({ className, classNames = {}, onDropHandler, ...props }, ref) => {
    const { children, element } = props;

    const state = useDraggableState({ element, onDropHandler });
    const { dropLine, isDragging, isHovered } = state;
    const {
      groupProps,
      droplineProps,
      gutterLeftProps,
      previewRef,
      handleRef,
    } = useDraggable(state);

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          isDragging && 'opacity-50',
          'group',
          className
        )}
        {...groupProps}
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
              <div ref={handleRef} className="size-4">
                {isHovered && dragHandle}
              </div>
            </div>
          </div>
        </div>

        <div className={classNames.blockWrapper} ref={previewRef}>
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
