import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';
import type { TAudioElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

export function MediaAudioStaticElement({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  const { url } = element as TAudioElement;

  return (
    <PlateStaticElement
      className={cn('relative mb-1', className)}
      element={element}
      {...props}
    >
      <figure className="group relative">
        <div className="h-16">
          <audio className="size-full" src={url} controls />
        </div>
      </figure>
      {children}
    </PlateStaticElement>
  );
}
