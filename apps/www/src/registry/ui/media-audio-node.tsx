'use client';

import * as React from 'react';

import type { TAudioElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { useMediaState } from '@platejs/media/react';
import { ResizableProvider } from '@platejs/resizable';
import { PlateElement, withHOC } from 'platejs/react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';

export const AudioElement = withHOC(
  ResizableProvider,
  function AudioElement(props: PlateElementProps<TAudioElement>) {
    const { align = 'center', selected, unsafeUrl } = useMediaState();
    const captionFocused = useCaptionFocused(props.path);

    return (
      <PlateElement {...props} className="mb-1">
        <figure className="group relative cursor-default [&>figcaption]:min-h-20">
          <div className={cn('h-16 rounded-sm')} contentEditable={false}>
            <audio className="size-full" src={unsafeUrl} controls />
          </div>
          <Caption
            active={selected || captionFocused}
            align={align}
            element={props.element}
            slots={props.slots}
          >
            {props.children}
          </Caption>
        </figure>
      </PlateElement>
    );
  }
);
