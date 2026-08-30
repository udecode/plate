import type { BaseImagePlugin } from 'platejs/media';
import { type PliteElementProps, PliteElement } from 'platejs/static';
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
            {/* oxlint-disable-next-line nextjs/no-img-element -- [P1 local-invariant] Static editor output preserves the document-owned runtime URL and width without Next loader ownership. */}
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
