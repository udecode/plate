import * as React from 'react';

import type { SlateElementProps, TMentionElement } from 'platejs';

import { IS_APPLE, KEYS, SlateElement } from 'platejs';

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
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm font-medium',
        element.children[0][KEYS.bold] === true && 'font-bold',
        element.children[0][KEYS.italic] === true && 'italic',
        element.children[0][KEYS.underline] === true && 'underline'
      )}
      data-slate-value={element.value}
      {...props}
    >
      {IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <React.Fragment>
          {props.children}
          {prefix}
          {element.value}
        </React.Fragment>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <React.Fragment>
          {prefix}
          {element.value}
          {props.children}
        </React.Fragment>
      )}
    </SlateElement>
  );
}
