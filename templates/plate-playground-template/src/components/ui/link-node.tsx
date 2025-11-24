'use client';

import { getLinkAttributes } from '@platejs/link';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import type { TInlineSuggestionData, TLinkElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  const suggestionData = props.editor
    .getApi(SuggestionPlugin)
    .suggestion.suggestionData(props.element) as
    | TInlineSuggestionData
    | undefined;

  return (
    <PlateElement
      {...props}
      as="a"
      attributes={{
        ...props.attributes,
        ...getLinkAttributes(props.editor, props.element),
        onMouseOver: (e) => {
          e.stopPropagation();
        },
      }}
      className={cn(
        'font-medium text-primary underline decoration-primary underline-offset-4',
        suggestionData?.type === 'remove' && 'bg-red-100 text-red-700',
        suggestionData?.type === 'insert' && 'bg-emerald-100 text-emerald-700'
      )}
    >
      {props.children}
    </PlateElement>
  );
}
