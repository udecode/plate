'use client';

import { cva } from 'class-variance-authority';
import {
  NodeApi,
  PathApi,
  SelectionApi,
  type Element,
  type Path,
  type RenderElementProps,
} from 'platejs';
import { useEditor, useEditorSelector, useElement } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const captionVariants = cva('max-w-full', {
  defaultVariants: {
    align: 'center',
  },
  variants: {
    align: {
      center: 'mx-auto text-center',
      left: 'mr-auto text-left',
      right: 'ml-auto text-right',
    },
  },
});

export function useCaptionFocused(path: Path) {
  return useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      SelectionApi.isText(selection) &&
      (PathApi.isDescendant(selection.anchor.path, path) ||
        PathApi.isDescendant(selection.focus.path, path))
    );
  });
}

export function Caption({
  active,
  align,
  children,
  className,
  element,
  placeholder = 'Write a caption...',
  slots,
  style,
  ...props
}: React.ComponentProps<'figcaption'> & {
  active: boolean;
  align?: 'center' | 'left' | 'right';
  element: Element;
  placeholder?: string;
  slots: RenderElementProps['slots'];
}) {
  const width = 'width' in element ? element.width : undefined;
  const empty = NodeApi.string(element).length === 0;
  const hidden = !active && empty;

  if (hidden) {
    if (element.children.length === 0) return null;

    return slots.contentBoundary({
      copyPolicy: 'model',
      mounted: false,
      reason: 'app-hidden',
      renderPlaceholder: () => null,
      scope: {
        from: 0,
        to: element.children.length - 1,
        type: 'children',
      },
      selectionPolicy: 'skip',
    });
  }

  return (
    <figcaption
      {...props}
      className={cn(
        captionVariants({ align }),
        'relative mt-2 min-h-6 w-full bg-inherit p-0 font-[inherit] text-inherit',
        'before:pointer-events-none before:absolute before:inset-x-0 before:text-muted-foreground before:content-[attr(data-placeholder)]',
        'print:placeholder:text-transparent',
        className
      )}
      data-placeholder={empty ? placeholder : undefined}
      style={{
        ...style,
        width:
          typeof width === 'number' || typeof width === 'string'
            ? width
            : undefined,
      }}
    >
      {children}
    </figcaption>
  );
}

export function CaptionButton({
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const editor = useEditor();
  const element = useElement();

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented) return;

        const point = editor.read.points.start(element);

        if (!point) return;

        editor.update.selection.set(point);
        editor.api.dom.focus();
      }}
    />
  );
}
