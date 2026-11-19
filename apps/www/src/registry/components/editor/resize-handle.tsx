'use client';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import {
  Resizable as ResizablePrimitive,
  ResizeHandle as ResizeHandlePrimitive,
} from 'platejs/resizable/react';
import * as React from 'react';

export const mediaResizeHandleVariants = cva(
  cn(
    'editor-media-resize-handle top-0 flex w-6 select-none flex-col justify-center',
    "after:flex after:h-16 after:w-[3px] after:rounded-[6px] after:bg-ring after:opacity-0 after:content-['_']"
  ),
  {
    variants: {
      direction: {
        left: '[left:--spacing(-3)] [margin-left:--spacing(-3)] [padding-left:--spacing(3)] after:[margin-right:auto]',
        right:
          '[right:--spacing(-3)] [margin-right:--spacing(-3)] [padding-right:--spacing(3)] after:[margin-left:auto]',
      },
    },
  }
);

const resizeHandleVariants = cva('absolute z-40', {
  variants: {
    direction: {
      bottom: 'w-full cursor-row-resize',
      left: 'h-full cursor-col-resize',
      right: 'h-full cursor-col-resize',
      top: 'w-full cursor-row-resize',
    },
  },
});

export function ResizeHandle({
  className,
  direction,
  ...props
}: React.ComponentProps<typeof ResizeHandlePrimitive> &
  VariantProps<typeof resizeHandleVariants>) {
  return (
    <ResizeHandlePrimitive
      aria-label="Resize media"
      className={cn(resizeHandleVariants({ direction }), className)}
      direction={direction}
      {...props}
    />
  );
}

const resizableVariants = cva('', {
  variants: {
    align: {
      center: 'mx-auto',
      end: 'ms-auto',
      left: '[margin-right:auto]',
      right: '[margin-left:auto]',
      start: 'me-auto',
    },
  },
});

export function Resizable({
  align,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive> &
  VariantProps<typeof resizableVariants>) {
  return (
    <ResizablePrimitive
      {...props}
      align={align}
      className={cn(resizableVariants({ align }), className)}
    />
  );
}
