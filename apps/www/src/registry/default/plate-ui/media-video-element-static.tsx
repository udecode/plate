import React from 'react';

import type { TCaptionElement } from '@udecode/plate-caption';
import type { StaticElementProps } from '@udecode/plate-common';
import type { TVideoElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { PlateStaticElement, getNodeString } from '@udecode/plate-common';

export function MediaVideoElementStatic({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  const {
    align = 'center',
    caption,
    url,
    width,
  } = element as TVideoElement &
    TCaptionElement & {
      width: number;
    };

  return (
    <PlateStaticElement
      className={cn('py-2.5', className)}
      element={element}
      {...props}
    >
      <div style={{ textAlign: align }}>
        <figure className="group relative m-0 inline-block" style={{ width }}>
          <video
            className={cn('w-full max-w-full object-cover px-0', 'rounded-sm')}
            src={url}
            controls
          />
          {caption && <figcaption>{getNodeString(caption[0])}</figcaption>}
        </figure>
      </div>
      {children}
    </PlateStaticElement>
  );
}
