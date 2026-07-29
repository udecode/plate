'use client';

import * as React from 'react';

import type { TImageElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { useDraggable } from '@platejs/dnd';
import { Image, ImagePlugin, useMediaState } from '@platejs/media/react';
import { ResizableProvider } from '@platejs/resizable';
import { PlateElement, withHOC } from 'platejs/react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';
import { MediaToolbar } from './media-toolbar';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resize-handle';

export const ImageElement = withHOC(
  ResizableProvider,
  function ImageElement(props: PlateElementProps<TImageElement>) {
    const { align = 'center', focused, selected } = useMediaState();
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
                align={align}
                options={{
                  align,
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
              align={align}
              element={props.element}
              slots={props.slots}
            >
              {props.children}
            </Caption>
          </figure>
        </PlateElement>
      </MediaToolbar>
    );
  }
);
