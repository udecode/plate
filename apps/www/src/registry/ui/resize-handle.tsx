'use client';

import * as React from 'react';

import type { VariantProps } from 'class-variance-authority';
import type { ResizableElement } from '@platejs/media';

import {
  type ResizeHandle as ResizeHandlePrimitive,
  Resizable as ResizablePrimitive,
  ResizableProvider,
  useResizeHandle,
  useResizeHandleState,
  useResizeHandleValue,
} from '@platejs/resizable';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

type RefComponent<P, R> = React.FC<P> & { ref?: React.Ref<R> };

export const withResizableProvider = <
  P extends { element: ResizableElement },
  R,
>(
  Component: RefComponent<P, R>
) =>
  React.forwardRef<R, P>((props, ref) => (
    <ResizableProvider width={props.element.width ?? '100%'}>
      <Component {...(props as any)} ref={ref} />
    </ResizableProvider>
  ));

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
  options,
  ...props
}: React.ComponentProps<typeof ResizeHandlePrimitive> &
  VariantProps<typeof resizeHandleVariants>) {
  const state = useResizeHandleState(options ?? {});
  const resizeHandle = useResizeHandle(state);
  const maxWidth = useResizeHandleValue('maxWidth');
  const minWidth = useResizeHandleValue('minWidth');
  const nudgeWidth = useResizeHandleValue('nudgeWidth');
  const width = useResizeHandleValue('width');

  if (state.readOnly) return null;

  const unit =
    typeof width === 'string' && width.trim().endsWith('%') ? '%' : 'px';
  const value = Number.parseFloat(String(width));

  return (
    <div
      aria-label="Resize media"
      aria-orientation="horizontal"
      aria-valuemax={Number.parseFloat(String(maxWidth))}
      aria-valuemin={Number.parseFloat(String(minWidth))}
      aria-valuenow={value}
      aria-valuetext={`${value}${unit}`}
      className={cn(
        resizeHandleVariants({ direction: options?.direction }),
        className
      )}
      data-resizing={state.isResizing}
      role="slider"
      tabIndex={0}
      {...resizeHandle.props}
      {...props}
      onKeyDown={(event) => {
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const step = event.shiftKey ? 50 : 10;
        const direction =
          event.key === 'ArrowUp'
            ? 1
            : event.key === 'ArrowDown'
              ? -1
              : event.key === 'ArrowRight'
                ? rtl
                  ? -1
                  : 1
                : event.key === 'ArrowLeft'
                  ? rtl
                    ? 1
                    : -1
                  : 0;

        if (direction !== 0) {
          event.preventDefault();
          nudgeWidth(direction * step);
        }

        props.onKeyDown?.(event);
      }}
    />
  );
}

const resizableVariants = cva('', {
  variants: {
    align: {
      center: 'mx-auto',
      left: 'mr-auto',
      right: 'ml-auto',
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
      className={cn(resizableVariants({ align }), className)}
    />
  );
}
