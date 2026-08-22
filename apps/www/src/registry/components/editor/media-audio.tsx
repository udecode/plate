'use client';

import type { AudioPlugin } from '@platejs/media/react';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement, useElementSelected, usePath } from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Caption, useCaptionFocused } from './caption';

export function AudioElement(props: PlateElementProps<typeof AudioPlugin>) {
  const path = usePath();
  const selected = useElementSelected({ mode: 'node' });
  const textAlign =
    'textAlign' in props.element &&
    (props.element.textAlign === 'left' ||
      props.element.textAlign === 'right' ||
      props.element.textAlign === 'center')
      ? props.element.textAlign
      : 'center';
  const captionFocused = useCaptionFocused(path);

  return (
    <PlateElement {...props} className="mb-1">
      <figure className="group relative cursor-default [&>figcaption]:min-h-20">
        <div className={cn('h-16 rounded-sm')} contentEditable={false}>
          {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- [P0 behavior-boundary] User media has no caption-track field; an empty fabricated track would falsely claim accessibility. */}
          <audio className="size-full" src={props.element.url} controls />
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
}
