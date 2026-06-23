import * as React from 'react';

import type { TMentionElement } from 'platejs';
import type { PliteElementProps } from 'platejs/static';

import { KEYS } from 'platejs';
import { PliteElement } from 'platejs/static';

import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/suggestion';

export function MentionElementStatic(
  props: PliteElementProps<TMentionElement> & {
    prefix?: string;
  }
) {
  const { prefix } = props;
  const element = props.element;

  return (
    <PliteElement
      {...props}
      as="span"
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm',
        inlineSuggestionVariants(),
        element.children[0][KEYS.bold] === true && 'font-bold',
        element.children[0][KEYS.italic] === true && 'italic',
        element.children[0][KEYS.underline] === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        'data-plite-value': element.value,
      }}
    >
      {props.children}
      {prefix}
      {element.value}
    </PliteElement>
  );
}
