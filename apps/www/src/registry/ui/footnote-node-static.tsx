import * as React from 'react';

import type { FootnoteElement } from '@platejs/footnote';
import type { PliteElementProps } from 'platejs/static';

import { PliteElement } from 'platejs/static';

export function FootnoteReferenceElementStatic(
  props: PliteElementProps<FootnoteElement>
) {
  const { element } = props;

  return (
    <PliteElement
      {...props}
      as="sup"
      className="mx-0.5 align-super font-medium text-primary text-xs"
    >
      {props.children}[{element.identifier ?? ''}]
    </PliteElement>
  );
}

export function FootnoteDefinitionElementStatic(
  props: PliteElementProps<FootnoteElement>
) {
  const { element } = props;

  return (
    <PliteElement {...props} as="div" className="mt-2 flex items-start gap-2">
      <div className="mt-0.5 min-w-4 text-muted-foreground text-sm tabular-nums">
        {element.identifier ?? ''}
      </div>
      <div className="min-w-0 flex-1">{props.children}</div>
    </PliteElement>
  );
}
