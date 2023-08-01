'use client';

import React, { ComponentProps } from 'react';
import {
  Resizable as ResizablePrimitive,
  ResizeHandle as ResizeHandlePrimitive,
} from '@udecode/plate-resizable';
import { cva, VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const resizeHandleVariants = cva(
  cn(
    'absolute top-0 z-10 flex h-full w-6 select-none flex-col justify-center',
    'after:flex after:h-16 after:bg-ring after:opacity-0 group-hover:after:opacity-100',
    "after:w-[3px] after:rounded-[6px] after:content-['_']"
  ),
  {
    variants: {
      direction: {
        left: '-left-3 -ml-3 cursor-col-resize pl-3',
        right: '-right-3 -mr-3 cursor-col-resize items-end pr-3',
        top: 'cursor-row-resize',
        bottom: 'cursor-row-resize',
      },
    },
  }
);

const ResizeHandle = React.forwardRef<
  React.ElementRef<typeof ResizeHandlePrimitive>,
  ComponentProps<typeof ResizeHandlePrimitive> &
    Omit<VariantProps<typeof resizeHandleVariants>, 'direction'>
>(({ className, ...props }, ref) => (
  <ResizeHandlePrimitive
    ref={ref}
    className={cn(
      resizeHandleVariants({ direction: props.options?.direction }),
      className
    )}
    {...props}
  />
));
ResizeHandle.displayName = 'ResizeHandle';

const resizableVariants = cva('', {
  variants: {
    align: {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
    },
  },
  defaultVariants: {
    align: 'center',
  },
});

const Resizable = React.forwardRef<
  React.ElementRef<typeof ResizablePrimitive>,
  ComponentProps<typeof ResizablePrimitive> &
    VariantProps<typeof resizableVariants>
>(({ className, align, ...props }, ref) => (
  <ResizablePrimitive
    ref={ref}
    className={cn(resizableVariants({ align }), className)}
    {...props}
  />
));
Resizable.displayName = 'Resizable';

export { Resizable, ResizeHandle };
