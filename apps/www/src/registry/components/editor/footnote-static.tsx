import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from 'platejs/footnote';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function FootnoteReferenceElementStatic(
  props: EditorElementProps<typeof BaseFootnotePlugin>
) {
  const { element } = props;

  return (
    <EditorElement
      {...props}
      as="sup"
      className="mx-0.5 align-super text-xs font-medium text-primary"
    >
      {props.children}[{element.ref ?? ''}]
    </EditorElement>
  );
}

export function FootnoteDefinitionElementStatic(
  props: EditorElementProps<typeof BaseFootnoteDefinitionPlugin>
) {
  const { element } = props;

  return (
    <EditorElement {...props} as="div" className="mt-2 flex items-start gap-2">
      <div className="mt-0.5 min-w-4 text-sm text-muted-foreground tabular-nums">
        {element.ref ?? ''}
      </div>
      <div className="min-w-0 flex-1">{props.children}</div>
    </EditorElement>
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
