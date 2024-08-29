import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, withHOC } from '@udecode/plate-common/react';
import { Image, ImagePlugin, useMediaState } from '@udecode/plate-media/react';
import { ResizableProvider, useResizableStore } from '@udecode/plate-resizable';

import { MediaPopover } from './media-popover';
import {
  Resizable,
  ResizeHandle,
  mediaResizeHandleVariants,
} from './resizable';

export const ImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(
    ({ children, className, nodeProps, ...props }, ref) => {
      const { align = 'center', focused, readOnly, selected } = useMediaState();

      const width = useResizableStore().get.width();

      return (
        <MediaPopover plugin={ImagePlugin}>
          <PlateElement
            className={cn('py-2.5', className)}
            ref={ref}
            {...props}
          >
            <Resizable
              align={align}
              options={{
                align,
                readOnly,
              }}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: 'left' })}
                options={{ direction: 'left' }}
              />
              <Image
                alt=""
                className={cn(
                  'block w-full max-w-full cursor-pointer object-cover px-0',
                  'rounded-sm',
                  focused && selected && 'ring-2 ring-ring ring-offset-2'
                )}
                {...nodeProps}
              />
              <ResizeHandle
                className={mediaResizeHandleVariants({
                  direction: 'right',
                })}
                options={{ direction: 'right' }}
              />
            </Resizable>
            {children}
          </PlateElement>
        </MediaPopover>
      );
    }
  )
);
