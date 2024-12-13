import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';
import type { TVideoElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function MediaVideoStaticElement({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  const { align, url, width } = element as TVideoElement & {
    width: number;
  };

  console.log('🚀 ~ align:', align);

  return (
    <PlateStaticElement
      className={cn('relative my-px rounded-sm', className)}
      element={element}
      {...props}
    >
      <div style={{ textAlign: align }}>
        <video
          className="inline-block"
          src={url}
          width={width}
          controls
        ></video>
      </div>
      {children}
    </PlateStaticElement>
  );
}
