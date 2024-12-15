import React from 'react';

import type { PlateElementStaticProps } from '@udecode/plate-common';
import type { TAudioElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export function MediaAudioElementStatic({
  children,
  className,
  element,
  ...props
}: PlateElementStaticProps) {
  const { url } = element as TAudioElement;

  return (
    <PlateElementStatic
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
    </PlateElementStatic>
  );
}
