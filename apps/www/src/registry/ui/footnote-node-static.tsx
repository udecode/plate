import * as React from 'react';

import type { TFootnoteElement } from '@platejs/footnote';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function FootnoteReferenceElementStatic(
  props: SlateElementProps<TFootnoteElement>
) {
  const { element } = props;

  return (
    <SlateElement
      {...props}
      as="sup"
      className="mx-0.5 align-super font-medium text-primary text-xs"
    >
      {props.children}[{element.identifier ?? ''}]
    </SlateElement>
  );
}

export function FootnoteDefinitionElementStatic(
  props: SlateElementProps<TFootnoteElement>
) {
  const { element } = props;

  return (
    <SlateElement {...props} as="div" className="mt-2 flex items-start gap-2">
      <div className="mt-0.5 min-w-4 text-muted-foreground text-sm tabular-nums">
        {element.identifier ?? ''}
      </div>
      <div className="min-w-0 flex-1">{props.children}</div>
    </SlateElement>
  );
}
