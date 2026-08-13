'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { useDraggable } from '@platejs/dnd';
import { Image, ImagePlugin, useMediaState } from '@platejs/media/react';
import { PlateElement, useEditor } from 'platejs/react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';
import { MediaToolbar } from './media-toolbar';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
  withResizableProvider,
} from './resize-handle';

export const ImageElement = withResizableProvider(function ImageElement(
  props: PlateElementProps<typeof ImagePlugin>
) {
  const {
    focused,
    selected,
    textAlign = 'center',
  } = useMediaState(ImagePlugin);
  const editor = useEditor();
  const captionFocused = useCaptionFocused(props.path);
  const { isDragging, handleRef } = useDraggable({
    element: props.element,
  });

  return (
    <MediaToolbar plugin={ImagePlugin} selected={selected}>
      <PlateElement {...props} className="py-2.5">
        <figure className="group relative m-0">
          <div contentEditable={false}>
            <Resizable
              align={textAlign}
              options={{
                align: textAlign,
                onResizeEnd: (width) =>
                  editor
                    .plugin(ImagePlugin)
                    .update.set({ width }, { at: props.path }),
                width: props.element.width,
              }}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'left' })}
                options={{ direction: 'left' }}
              />
              <div>
                <Image
                  ref={handleRef}
                  className={cn(
                    'block w-full max-w-full cursor-pointer object-cover px-0',
                    'rounded-sm',
                    focused && selected && 'ring-2 ring-ring ring-offset-2',
                    isDragging && 'opacity-50'
                  )}
                  alt={props.element.alt}
                />
              </div>
              <ResizeHandle
                className={mediaResizeHandleVariants({
                  direction: 'right',
                })}
                options={{ direction: 'right' }}
              />
            </Resizable>
          </div>
          <Caption
            active={selected || captionFocused}
            align={textAlign}
            element={props.element}
            slots={props.slots}
          >
            {props.children}
          </Caption>
        </figure>
      </PlateElement>
    </MediaToolbar>
  );
});
