import * as React from 'react';

import type { SlateElementProps, TMentionElement } from 'platejs';

import { KEYS, SlateElement } from 'platejs';

import { cn } from '@/lib/utils';

export function MentionElementStatic(
  props: SlateElementProps<TMentionElement> & {
    prefix?: string;
  }
) {
  const { prefix } = props;
  const element = props.element;

  return (
    <SlateElement
      {...props}
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium',
        element.children[0][KEYS.bold] === true && 'font-bold',
        element.children[0][KEYS.italic] === true && 'italic',
        element.children[0][KEYS.underline] === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        'data-slate-value': element.value,
      }}
    >
      <React.Fragment>
        {props.children}
        {prefix}
        {element.value}
      </React.Fragment>
    </SlateElement>
  );
}
