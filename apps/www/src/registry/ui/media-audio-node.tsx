'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { AudioPlugin, useMediaState } from '@platejs/media/react';
import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';
import { withResizableProvider } from './resize-handle';

export const AudioElement = withResizableProvider(function AudioElement(
  props: PlateElementProps<typeof AudioPlugin>
) {
  const {
    selected,
    textAlign = 'center',
    unsafeUrl,
  } = useMediaState(AudioPlugin);
  const captionFocused = useCaptionFocused(props.path);

  return (
    <PlateElement {...props} className="mb-1">
      <figure className="group relative cursor-default [&>figcaption]:min-h-20">
        <div className={cn('h-16 rounded-sm')} contentEditable={false}>
          <audio className="size-full" src={unsafeUrl} controls />
        </div>
        <Caption
          active={selected || captionFocused}
          align={textAlign}
          element={props.element}
          slots={props.slots}
        >
          {props.children}
        </Caption>
      </figure>
    </PlateElement>
  );
});
