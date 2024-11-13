'use client';

import React, { useCallback, useEffect } from 'react';

import { cn, useComposedRef, useOnClickOutside } from '@udecode/cn';
import { useEditorPlugin } from '@udecode/plate-core/react';
import {
  type UseVirtualFloatingOptions,
  flip,
  getDOMSelectionBoundingClientRect,
  getRangeBoundingClientRect,
  offset,
  useVirtualFloating,
} from '@udecode/plate-floating';
import { insertImage } from '@udecode/plate-media';
import { MediaFloatingPlugin } from '@udecode/plate-media/react';
import { getAboveNode, getEndPoint, getStartPoint } from '@udecode/slate';
import { mergeProps } from '@udecode/utils';
import { ImageIcon } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { popoverVariants } from './popover';
import { Separator } from './separator';

const floatingOptions: UseVirtualFloatingOptions = {
  middleware: [
    offset(12),
    flip({
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
      padding: 12,
    }),
  ],
  placement: 'bottom-start',
};

export function MediaFloatingToolbar() {
  const { api, editor, setOption, type, useOption } =
    useEditorPlugin(MediaFloatingPlugin);

  const isOpen = useOption('isOpen');
  const url = useOption('url');

  const getBoundingClientRect = React.useCallback(() => {
    const entry = getAboveNode(editor, {
      match: { type },
    });

    if (entry) {
      const [, path] = entry;

      return getRangeBoundingClientRect(editor, {
        anchor: getStartPoint(editor, path),
        focus: getEndPoint(editor, path),
      });
    }

    return getDOMSelectionBoundingClientRect();
  }, [editor, type]);

  const clickOutsideRef = useOnClickOutside(() => {
    if (!isOpen) return;

    api.mediaFloating.hide();
  });

  const floating = useVirtualFloating(
    mergeProps(
      {
        getBoundingClientRect,
        open: isOpen,
      },
      floatingOptions
    )
  );

  const onEmbed = useCallback(
    (value: string) => {
      insertImage(editor, value);
      api.mediaFloating.hide();
    },
    [editor, api.mediaFloating]
  );

  const handleCancel = () => {
    api.mediaFloating.hide();
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });

      setTimeout(() => {
        console.log(document.activeElement, 'fj');
      }, 1000);
    }, 0);
  }, [isOpen]);

  return (
    <div
      ref={useComposedRef<HTMLElement | null>(
        floating.refs.setFloating,
        clickOutsideRef
      )}
      className={cn(popoverVariants(), 'w-auto p-1')}
      style={floating.style}
    >
      <div className="flex w-[330px] flex-col">
        <div className="flex items-center">
          <div className="flex items-center pl-2 pr-1">
            <ImageIcon className="size-4" />
          </div>

          <Input
            ref={inputRef}
            variant="ghost"
            value={url}
            onChange={(e) => setOption('url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            h="sm"
          />
        </div>
        <Separator className="my-1" />
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button size="sm" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="default" onClick={() => onEmbed(url)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
