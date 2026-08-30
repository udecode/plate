import type { BaseAudioPlugin } from 'platejs/media';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { CaptionStatic } from './caption-static';

export function AudioElementStatic(
  props: PliteElementProps<typeof BaseAudioPlugin>
) {
  return (
    <PliteElement {...props} className="mb-1">
      <figure className="group relative cursor-default">
        <div className={cn('h-16 rounded-sm')}>
          {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- [P0 behavior-boundary] User media has no caption-track field; an empty fabricated track would falsely claim accessibility. */}
          <audio className="size-full" src={props.element.url} controls />
        </div>
        <CaptionStatic element={props.element}>{props.children}</CaptionStatic>
      </figure>
    </PliteElement>
  );
}
