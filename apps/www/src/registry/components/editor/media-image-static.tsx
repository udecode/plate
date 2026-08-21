import type { BaseImagePlugin } from '@platejs/media';
import type { PliteElementProps } from 'platejs/static';
import { PliteElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { CaptionStatic, getMediaTextAlign } from './caption-static';

export function ImageElementStatic(
  props: PliteElementProps<typeof BaseImagePlugin>
) {
  const { alt, url, width } = props.element;
  const textAlign = getMediaTextAlign(props.element);

  return (
    <PliteElement {...props} className="py-2.5">
      <figure className="group relative m-0 inline-block" style={{ width }}>
        <div className="relative max-w-full min-w-[92px]" style={{ textAlign }}>
          <div>
            <img
              className={cn(
                'w-full max-w-full cursor-default object-cover px-0',
                'rounded-sm'
              )}
              alt={alt}
              src={url}
            />
          </div>
        </div>
        <CaptionStatic align={textAlign} element={props.element}>
          {props.children}
        </CaptionStatic>
      </figure>
    </PliteElement>
  );
}
