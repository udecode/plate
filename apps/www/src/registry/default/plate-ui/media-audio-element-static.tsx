import React from 'react';

import type { SlateElementProps } from '@udecode/plate-common';
import type { TAudioElement } from '@udecode/plate-media';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate-common';

export function MediaAudioElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  const { align, isUpload, url, width } = props.element as TAudioElement;

  return (
    <SlateElement className={cn(className, 'mb-1')} {...props}>
      <figure className="group relative cursor-default">
        <div className="h-16">
          <audio
            className="size-full"
            data-slate-align={align}
            data-slate-is-upload={isUpload}
            data-slate-width={width}
            src={url}
            controls
          />
        </div>
      </figure>
      {children}
    </SlateElement>
  );
}
