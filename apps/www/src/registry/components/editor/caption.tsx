'use client';

import { cva } from 'class-variance-authority';
import { cn } from 'cn';
import {
  NodeApi,
  PathApi,
  RangeApi,
  type Element,
  type Path,
  type RenderElementProps,
} from 'platejs';
import {
  useEditor,
  useEditorSelector,
  useElement,
  usePath,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

const captionVariants = cva('max-w-full', {
  defaultVariants: {
    align: 'center',
  },
  variants: {
    align: {
      center: 'mx-auto justify-center text-center',
      end: 'ms-auto justify-end text-end',
      left: '[margin-right:auto] [justify-content:left] [text-align:left]',
      right: '[margin-left:auto] [justify-content:right] [text-align:right]',
      start: 'me-auto justify-start text-start',
    },
  },
});

export const getMediaTextAlign = (element: object) => {
  if (!('textAlign' in element)) return 'center';

  switch (element.textAlign) {
    case 'end':
    case 'left':
    case 'right': {
      return element.textAlign;
    }
    case 'justify':
    case 'start': {
      return 'start';
    }
    default: {
      return 'center';
    }
  }
};

export function useCaptionFocused(path: Path) {
  return useEditorSelector((editor) => {
    // A media NodeSelection also reads as a caret at the caption start.
    if (editor.read.selection.nodes().length > 0) return false;

    const selection = editor.read.selection();

    return (
      RangeApi.isRange(selection) &&
      (PathApi.isDescendant(selection.anchor.path, path) ||
        PathApi.isDescendant(selection.focus.path, path))
    );
  });
}

export function Caption({
  align,
  children,
  className,
  element,
  placeholder = 'Write a caption...',
  slots: _slots,
  style,
  ...props
}: React.ComponentProps<'figcaption'> & {
  align?: ReturnType<typeof getMediaTextAlign>;
  element: Element;
  placeholder?: string;
  slots: RenderElementProps['slots'];
}) {
  const editor = useEditor();
  const path = usePath();
  const nodeKey = editor.key(element);
  const width = 'width' in element ? element.width : undefined;
  const empty = useEditorSelector(
    (current) =>
      NodeApi.string(current.read.nodes.get(path)?.[0] ?? element).length === 0,
    {
      shouldUpdate: (change) =>
        !change ||
        !nodeKey ||
        change.changed.hasNodeKey(nodeKey, 'node', editor.read.view.root()),
    }
  );
  const focused = useCaptionFocused(path);
  const hidden = !focused && empty;

  return (
    <figcaption
      {...props}
      className={cn(
        captionVariants({ align }),
        'relative mt-2 min-h-6 w-full bg-inherit p-0 font-[inherit] text-inherit',
        focused && empty && 'flex items-center',
        'after:pointer-events-none after:text-muted-foreground after:content-[attr(data-placeholder)]',
        'print:placeholder:text-transparent',
        className
      )}
      data-placeholder={empty ? placeholder : undefined}
      hidden={hidden}
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
