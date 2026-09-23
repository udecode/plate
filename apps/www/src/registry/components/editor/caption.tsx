'use client';

import { cva } from 'class-variance-authority';
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
import { cn } from '@/lib/utils';

const captionVariants = cva('max-w-full', {
  defaultVariants: {
    align: 'center',
  },
  variants: {
    align: {
      center: 'mx-auto justify-center text-center',
      left: 'mr-auto justify-start text-left',
      right: 'ml-auto justify-end text-right',
    },
  },
});

export function useCaptionFocused(path: Path) {
  return useEditorSelector((editor) => {
    const selection = editor.read.selection();

    return (
      RangeApi.isRange(selection) &&
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
  slots: _slots,
  style,
  ...props
}: React.ComponentProps<'figcaption'> & {
  active: boolean;
  align?: 'center' | 'left' | 'right';
  element: Element;
  placeholder?: string;
  slots: RenderElementProps['slots'];
}) {
  const editor = useEditor();
  const path = usePath();
  const nodeKey = editor.read((state) => state.key(path));
  const width = 'width' in element ? element.width : undefined;
  const empty = useEditorSelector(
    (current) =>
      NodeApi.string(current.read.nodes.get(path)?.[0] ?? element).length === 0,
    {
      shouldUpdate: (change) =>
        !change || !nodeKey || change.changed.hasNodeKey(nodeKey, 'node'),
    }
  );
  const hidden = !active && empty;

  return (
    <figcaption
      {...props}
      className={cn(
        captionVariants({ align }),
        'relative mt-2 min-h-6 w-full bg-inherit p-0 font-[inherit] text-inherit',
        active && empty && 'flex items-center',
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
