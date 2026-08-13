import * as React from 'react';

import { type BaseDatePlugin, getDateDisplayLabel } from '@platejs/date';
import type { PliteElementProps } from 'platejs/static';

import { PliteElement } from 'platejs/static';
import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function DateElementStatic(
  props: PliteElementProps<typeof BaseDatePlugin>
) {
  const { element } = props;

  return (
    <PliteElement as="span" className="inline-block" {...props}>
      <span
        className={cn(
          'w-fit rounded-sm bg-muted px-1 text-muted-foreground',
          inlineSuggestionVariants()
        )}
      >
        {element.date || element.rawDate ? (
          getDateDisplayLabel(element)
        ) : (
          <span>Pick a date</span>
        )}
      </span>
      {props.children}
    </PliteElement>
  );
}
