'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  type TCloudImageElement,
  useCloudImageElementState,
} from '@udecode/plate-cloud';
import {
  type PlateElementProps,
  PlateElement,
} from '@udecode/plate-common/react';

import { ResizeControls } from './cloud-resize-controls';
import { StatusBar } from './cloud-status-bar';

export interface CloudImageElementProps
  extends PlateElementProps<TCloudImageElement> {}

export function CloudImageElement({
  className,
  ...props
}: CloudImageElementProps) {
  const { children, element } = props;

  const { focused, selected, setSize, size, src, srcSet, upload } =
    useCloudImageElementState({ element });

  return (
    <PlateElement
      className={cn('relative my-4', className)}
      draggable
      {...props}
    >
      <span
        style={{
          display: 'inline-block',
          /**
           * NOTE: This code pretty much needs to be this way or things stop
           * working so this cannot be overrided in the `.styles.ts` file.
           */
          position: 'relative',
          /** Disable user select. We use our own selection display. */
          userSelect: 'none',
          /**
           * This is required so that we don't get an extra gap at the bottom.
           * When display is 'inline-block' we get some extra space at the
           * bottom for the descenders because the content is expected to
           * co-exist with text.
           *
           * Setting vertical-align to top, bottom or middle fixes this because
           * it is no longer baseline which causes the issue.
           *
           * This is usually an issue with 'img' but also affects this scenario.
           *
           * https://stackoverflow.com/questions/5804256/image-inside-div-has-extra-space-below-the-image
           *
           * Also, make sure that <img> on the inside is display: 'block'.
           */
          verticalAlign: 'top',
        }}
        contentEditable={false}
      >
        {src === '' ? (
          <div
            className={cn(
              'block rounded-lg',
              focused && selected && 'shadow-[0_0_1px_3px_#60a5fa]'
            )}
            style={{
              background: '#e0e0e0',
              height: size.height,
              width: size.width,
            }}
          />
        ) : (
          <img
            className={cn(
              'block rounded-lg',
              focused && selected && 'shadow-[0_0_1px_3px_#60a5fa]'
            )}
            alt=""
            height={size.height}
            src={src}
            srcSet={srcSet}
            width={size.width}
          />
        )}
        <div className="absolute inset-x-2 top-1/2 -mt-2">
          <StatusBar upload={upload} />
        </div>
        {selected && focused && (
          <ResizeControls size={size} element={element} setSize={setSize} />
        )}
      </span>
      {children}
    </PlateElement>
  );
}
