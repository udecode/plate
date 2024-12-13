import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';
import type { TImageElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function ImageStaticElement({
  children,
  className,
  element,
  nodeProps,
  ...props
}: StaticElementProps) {
  const {
    align = 'center',
    url,
    width,
  } = element as TImageElement & {
    width: number;
  };

  return (
    <PlateStaticElement
      className={cn('py-2.5', className)}
      element={element}
      {...props}
    >
      <figure
        className="group relative m-0"
        style={{ textAlign: align, width: width }}
      >
        <div style={{ width: width }}>
          <img
            className={cn(
              'inline-block w-full max-w-full object-cover px-0',
              'rounded-sm'
            )}
            alt=""
            src={url}
            {...nodeProps}
          />
        </div>
      </figure>
      {children}
    </PlateStaticElement>
  );
}
