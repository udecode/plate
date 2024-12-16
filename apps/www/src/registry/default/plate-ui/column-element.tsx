'use client';

import React from 'react';

import type { TColumnElement } from '@udecode/plate-layout';

import { cn, useComposedRef, withRef } from '@udecode/cn';
import { useElement, withHOC } from '@udecode/plate-common/react';
import {
  useDraggable,
  useDraggableState,
  useDropLine,
} from '@udecode/plate-dnd';
import { ResizableProvider } from '@udecode/plate-resizable';
import { GripHorizontal } from 'lucide-react';
import { Path } from 'slate';
import { useReadOnly } from 'slate-react';

import { Button } from '@/registry/default/plate-ui/button';

import { PlateElement } from './plate-element';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

const DRAG_ITEM_COLUMN = 'column';

export const ColumnElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const readOnly = useReadOnly();
    const { width } = useElement<TColumnElement>();

    const state = useDraggableState({
      canDropNode: ({ dragEntry, dropEntry }) =>
        Path.equals(Path.parent(dragEntry[1]), Path.parent(dropEntry[1])),
      element: props.element,
      orientation: 'horizontal',
      type: DRAG_ITEM_COLUMN,
    });

    const { previewRef, handleRef } = useDraggable(state);

    return (
      <div className="group/column relative" style={{ width: width ?? '100%' }}>
        <div
          ref={handleRef}
          className={cn(
            'absolute left-1/2 top-2 z-50 -translate-x-1/2 -translate-y-1/2',
            'pointer-events-auto flex items-center',
            'opacity-0 transition-opacity group-hover/column:opacity-100'
          )}
        >
          <ColumnDragHandle />
        </div>

        <PlateElement
          ref={useComposedRef(ref, previewRef)}
          className={cn(
            className,
            'h-full px-2 pt-2 group-first/column:pl-0 group-last/column:pr-0'
          )}
          {...props}
        >
          <div
            className={cn(
              'relative h-full p-1.5',
              !readOnly && 'rounded-lg border border-dashed',
              state.isDragging && 'opacity-50'
            )}
          >
            {children}
            <DropLine />
          </div>
        </PlateElement>
      </div>
    );
  })
);

const ColumnDragHandle = React.memo(() => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="none" variant="ghost" className="h-5 px-1">
            <GripHorizontal
              className="size-4 text-muted-foreground"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
              }}
            />
          </Button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>Drag to move column</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
});

const DropLine = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const state = useDropLine({ orientation: 'horizontal' });

  if (!state.dropLine) return null;

  return (
    <div
      ref={ref}
      {...props}
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className={cn(
        'slate-dropLine',
        'absolute bg-brand/50',
        state.dropLine === 'left' &&
          'inset-y-0 left-[-10.5px] w-1 group-first/column:-left-1',
        state.dropLine === 'right' &&
          'inset-y-0 right-[-11px] w-1 group-last/column:-right-1',
        className
      )}
    />
  );
});
