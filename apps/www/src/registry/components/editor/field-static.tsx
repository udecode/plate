import { CheckIcon } from 'lucide-react';
import { BaseFieldPlugin, fillsField } from 'platejs/field';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

export function FieldElementStatic(
  props: EditorElementProps<typeof BaseFieldPlugin>
) {
  const { element } = props;
  const { kind, options, value } = element;
  let shown: React.ReactNode = (
    <span
      aria-label="Blank"
      className="inline-block h-4 w-24 border-b border-current"
      role="img"
    />
  );

  if (kind === 'checkbox') {
    shown = (
      <span
        aria-label={value === true ? 'Ticked' : 'Not ticked'}
        className="inline-flex size-3.5 items-center justify-center rounded-[3px] border border-current align-middle"
        role="img"
      >
        {value === true && <CheckIcon className="size-3" />}
      </span>
    );
  } else if (fillsField(element, value)) {
    shown =
      kind === 'choice'
        ? options?.find((option) => option.value === value)?.label
        : String(value);
  }

  return (
    <EditorElement as="span" className="inline-block" {...props}>
      {shown}
      {props.children}
    </EditorElement>
  );
}

export const BaseFieldKit = [
  BaseFieldPlugin.configure({ component: FieldElementStatic }),
];
