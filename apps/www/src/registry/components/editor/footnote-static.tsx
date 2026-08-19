import * as React from 'react';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '@platejs/footnote';
import { type PliteElementProps, PliteElement } from 'platejs/static';

export function FootnoteReferenceElementStatic(
  props: PliteElementProps<typeof BaseFootnotePlugin>
) {
  const { element } = props;

  return (
    <PliteElement
      {...props}
      as="sup"
      className="mx-0.5 align-super font-medium text-primary text-xs"
    >
      {props.children}[{element.ref ?? ''}]
    </PliteElement>
  );
}

export function FootnoteDefinitionElementStatic(
  props: PliteElementProps<typeof BaseFootnoteDefinitionPlugin>
) {
  const { element } = props;

  return (
    <PliteElement {...props} as="div" className="mt-2 flex items-start gap-2">
      <div className="mt-0.5 min-w-4 text-muted-foreground text-sm tabular-nums">
        {element.ref ?? ''}
      </div>
      <div className="min-w-0 flex-1">{props.children}</div>
    </PliteElement>
  );
}

export const BaseFootnoteKit = [
  BaseFootnotePlugin.configure({
    component: FootnoteReferenceElementStatic,
  }),
  BaseFootnoteDefinitionPlugin.configure({
    component: FootnoteDefinitionElementStatic,
  }),
];
