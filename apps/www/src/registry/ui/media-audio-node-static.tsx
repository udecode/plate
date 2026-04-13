import * as React from 'react';

import type { TAudioElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';
import {
  getStaticElementSuggestionData,
  voidRemoveSuggestionClass,
} from '@/registry/ui/suggestion-node-static';

export function AudioElementStatic(props: SlateElementProps<TAudioElement>) {
  const isRemoveSuggestion =
    getStaticElementSuggestionData(props.element)?.type === 'remove';

  return (
    <SlateElement {...props} className="mb-1">
      <figure className="group relative cursor-default">
        <div
          className={cn(
            'h-16 rounded-sm',
            isRemoveSuggestion && voidRemoveSuggestionClass
          )}
        >
          <audio className="size-full" src={props.element.url} controls />
        </div>
      </figure>
      {props.children}
    </SlateElement>
  );
}
