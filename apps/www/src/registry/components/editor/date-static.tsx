import { BaseDatePlugin, parseCanonicalDateValue } from 'platejs/date';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: 'UTC',
});

const getDateLabel = (value: string) =>
  parseCanonicalDateValue(value) ? dateFormat.format(Date.parse(value)) : value;

export function DateElementStatic(
  props: EditorElementProps<typeof BaseDatePlugin>
) {
  const { element } = props;

  return (
    <EditorElement as="span" className="inline-block" {...props}>
      <span className="w-fit rounded-sm bg-muted px-1 text-muted-foreground">
        {getDateLabel(element.value)}
      </span>
      {props.children}
    </EditorElement>
  );
}

export const BaseDateKit = [
  BaseDatePlugin.configure({ component: DateElementStatic }),
];
