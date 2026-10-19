import { BaseMentionPlugin } from 'platejs/mention';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function MentionElementStatic(
  props: EditorElementProps<typeof BaseMentionPlugin> & {
    prefix?: string;
  }
) {
  const { prefix } = props;
  const { element } = props;
  const label = element.label ?? element.ref;

  return (
    <EditorElement
      {...props}
      as="span"
      className={cn(
        'inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline font-medium text-sm',
        element.children[0].bold === true && 'font-bold',
        element.children[0].italic === true && 'italic',
        element.children[0].underline === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        'data-editor-value': label,
      }}
    >
      {props.children}
      {prefix}
      {label}
    </EditorElement>
  );
}

export const BaseMentionKit = [
  BaseMentionPlugin.configure({
    component: MentionElementStatic,
  }),
];
