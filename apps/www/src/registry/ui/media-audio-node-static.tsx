import * as React from 'react';

import type { TAudioElement } from 'platejs';
import type { PliteElementProps } from 'platejs/static';

import { PliteElement } from 'platejs/static';

import { cn } from '@/lib/utils';

import { CaptionStatic } from './caption-static';

export function AudioElementStatic(props: PliteElementProps<TAudioElement>) {
  return (
    <PliteElement {...props} className="mb-1">
      <figure className="group relative cursor-default">
        <div className={cn('h-16 rounded-sm')}>
          <audio className="size-full" src={props.element.url} controls />
        </div>
        <CaptionStatic element={props.element}>{props.children}</CaptionStatic>
      </figure>
    </PliteElement>
  );
}
