import { BaseDatePlugin, getDateDisplayLabel } from 'platejs/date';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function DateElementStatic(
  props: EditorElementProps<typeof BaseDatePlugin>
) {
  const { element } = props;

  return (
    <EditorElement as="span" className="inline-block" {...props}>
      <span className="w-fit rounded-sm bg-muted px-1 text-muted-foreground">
        {getDateDisplayLabel(element.value)}
      </span>
      {props.children}
    </EditorElement>
  );
}

export const BaseDateKit = [
  BaseDatePlugin.configure({ component: DateElementStatic }),
];
