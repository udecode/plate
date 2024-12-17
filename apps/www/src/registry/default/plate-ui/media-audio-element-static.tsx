import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';
import type { TAudioElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export function MediaAudioElementStatic({
  children,
  className,
  element,
  ...props
}: SlateElementProps) {
  const { url } = element as TAudioElement;

  return (
    <SlateElement
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
    </SlateElement>
  );
}
