import React from 'react';
import {
  PlateElement,
  PlateElementProps,
  Value,
  withHOC,
} from '@udecode/plate-common';
import {
  ELEMENT_IMAGE,
  Image,
  TImageElement,
  useMediaState,
} from '@udecode/plate-media';
import { ResizableProvider, useResizableStore } from '@udecode/plate-resizable';

import { cn } from '@/lib/utils';

import { Caption, CaptionTextarea } from './caption';
import { MediaPopover } from './media-popover';
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from './resizable';

const ImageElement = withHOC(
  ResizableProvider,
  ({
    className,
    children,
    nodeProps,
    ...props
  }: PlateElementProps<Value, TImageElement>) => {
    const { readOnly, focused, selected, align = 'center' } = useMediaState();
    const width = useResizableStore().get.width();

    return (
      <MediaPopover pluginKey={ELEMENT_IMAGE}>
        <PlateElement className={cn('py-2.5', className)} {...props}>
          <figure className="group relative m-0" contentEditable={false}>
            <Resizable
              align={align}
              options={{
                align,
                readOnly,
              }}
            >
              <ResizeHandle
                options={{ direction: 'left' }}
                className={mediaResizeHandleVariants({ direction: 'left' })}
              />
              <Image
                className={cn(
                  'block w-full max-w-full cursor-pointer object-cover px-0',
                  'rounded-sm',
                  focused && selected && 'ring-2 ring-ring ring-offset-2'
                )}
                alt=""
                {...nodeProps}
              />
              <ResizeHandle
                options={{ direction: 'right' }}
                className={mediaResizeHandleVariants({ direction: 'right' })}
              />
            </Resizable>

            <Caption align={align} style={{ width }}>
              <CaptionTextarea
                placeholder="Write a caption..."
                readOnly={readOnly}
              />
            </Caption>
          </figure>

          {children}
        </PlateElement>
      </MediaPopover>
    );
  }
);
ImageElement.displayName = 'ImageElement';

export { ImageElement };
