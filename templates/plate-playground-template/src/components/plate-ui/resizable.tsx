'use client';

import React from 'react';

import { cn, createPrimitiveElement, withRef, withVariants } from '@udecode/cn';
import {
  type ResizeHandle as ResizeHandlePrimitive,
  Resizable as ResizablePrimitive,
  useResizeHandle,
  useResizeHandleState,
} from '@udecode/plate-resizable';
import { cva } from 'class-variance-authority';

export const mediaResizeHandleVariants = cva(
  cn(
    'top-0 flex w-6 select-none flex-col justify-center',
    "after:flex after:h-16 after:w-[3px] after:rounded-[6px] after:bg-ring after:opacity-0 after:content-['_'] group-hover:after:opacity-100"
  ),
  {
    variants: {
      direction: {
        left: '-left-3 -ml-3 pl-3',
        right: '-right-3 -mr-3 items-end pr-3',
      },
    },
  }
);

const resizeHandleVariants = cva(cn('absolute z-40'), {
  variants: {
    direction: {
      bottom: 'w-full cursor-row-resize',
      left: 'h-full cursor-col-resize',
      right: 'h-full cursor-col-resize',
      top: 'w-full cursor-row-resize',
    },
  },
});

const ResizeHandleVariants = withVariants(
  createPrimitiveElement('div'),
  resizeHandleVariants,
  ['direction']
);

export const ResizeHandle = withRef<typeof ResizeHandlePrimitive>(
  ({ options, ...props }, ref) => {
    const state = useResizeHandleState(options ?? {});
    const resizeHandle = useResizeHandle(state);

    if (state.readOnly) return null;

    return (
      <ResizeHandleVariants
        ref={ref}
        data-resizing={state.isResizing}
        direction={options?.direction}
        {...resizeHandle.props}
        {...props}
      />
    );
  }
);

const resizableVariants = cva('', {
  variants: {
    align: {
      center: 'mx-auto',
      left: 'mr-auto',
      right: 'ml-auto',
    },
  },
});

export const Resizable = withVariants(ResizablePrimitive, resizableVariants, [
  'align',
]);
