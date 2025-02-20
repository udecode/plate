'use client';

import React from 'react';

import type { TColumnElement } from '@udecode/plate-layout';

import { cn, useComposedRef, withRef } from '@udecode/cn';
import { PathApi } from '@udecode/plate';
import { useDraggable, useDropLine } from '@udecode/plate-dnd';
import { ResizableProvider } from '@udecode/plate-resizable';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import {
  PlateElement,
  usePluginOption,
  useReadOnly,
  withHOC,
} from '@udecode/plate/react';
import { GripHorizontal } from 'lucide-react';

import { Button } from './button';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

export const ColumnElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const { width } = props.element as TColumnElement;
    const readOnly = useReadOnly();
    const isSelectionAreaVisible = usePluginOption(
      BlockSelectionPlugin,
      'isSelectionAreaVisible'
    );

    const { isDragging, previewRef, handleRef } = useDraggable({
      element: props.element,
      orientation: 'horizontal',
      type: 'column',
      canDropNode: ({ dragEntry, dropEntry }) =>
        PathApi.equals(
          PathApi.parent(dragEntry[1]),
          PathApi.parent(dropEntry[1])
        ),
    });

    return (
      <div className="group/column relative" style={{ width: width ?? '100%' }}>
        {!readOnly && !isSelectionAreaVisible && (
          <div
            ref={handleRef}
            className={cn(
              'absolute top-2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
              'pointer-events-auto flex items-center',
              'opacity-0 transition-opacity group-hover/column:opacity-100'
            )}
          >
            <ColumnDragHandle />
          </div>
        )}

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
              'relative h-full border border-transparent p-1.5',
              !readOnly && 'rounded-lg border-dashed border-border',
              isDragging && 'opacity-50'
            )}
          >
            {children}

            {!readOnly && !isSelectionAreaVisible && <DropLine />}
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
  const { dropLine } = useDropLine({ orientation: 'horizontal' });

  if (!dropLine) return null;

  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        'slate-dropLine',
        'absolute bg-brand/50',
        dropLine === 'left' &&
          'inset-y-0 left-[-10.5px] w-1 group-first/column:-left-1',
        dropLine === 'right' &&
          'inset-y-0 right-[-11px] w-1 group-last/column:-right-1',
        className
      )}
    />
  );
});
