import { cn } from 'cn';
import { BaseFieldPlugin } from 'platejs/field';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function FieldElementStatic(
  props: EditorElementProps<typeof BaseFieldPlugin>
) {
  const { label, options, value } = props.element;
  const answer = String(
    options?.find((option) => option.value === value)?.label ?? value ?? ''
  );

  return (
    <EditorElement as="span" className="inline-block" {...props}>
      <span
        className={cn(
          'w-fit rounded-sm bg-muted px-1',
          !answer && 'text-muted-foreground'
        )}
      >
        {answer || label}
      </span>
      {props.children}
    </EditorElement>
  );
}

export const BaseFieldKit = [
  BaseFieldPlugin.configure({ component: FieldElementStatic }),
];
