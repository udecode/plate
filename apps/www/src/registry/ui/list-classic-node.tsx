'use client';

import * as React from 'react';

import type { TTodoListItemElement } from '@platejs/list-classic';
import type { PlateElementProps } from 'platejs/react';

import {
  useTodoListElement,
  useTodoListElementState,
} from '@platejs/list-classic/react';
import { PlateElement } from 'platejs/react';
import { type VariantProps, cva } from 'class-variance-authority';

import { Checkbox } from '@/components/ui/checkbox';

const listVariants = cva('m-0 ps-6', {
  variants: {
    variant: {
      ol: 'list-decimal',
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
    },
  },
});

export function ListElement({
  variant,
  ...props
}: PlateElementProps & VariantProps<typeof listVariants>) {
  return (
    <PlateElement
      as={variant!}
      className={listVariants({ variant })}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export function BulletedListElement(props: PlateElementProps) {
  return <ListElement variant="ul" {...props} />;
}

export function NumberedListElement(props: PlateElementProps) {
  return <ListElement variant="ol" {...props} />;
}

export function TodoListElement(
  props: PlateElementProps<TTodoListItemElement>
) {
  const { element } = props;
  const state = useTodoListElementState({ element });
  const { checkboxProps } = useTodoListElement(state);

  return (
    <PlateElement {...props} className="flex flex-row py-1">
      <div
        className="mr-1.5 flex items-center justify-center select-none"
        contentEditable={false}
      >
        <Checkbox {...checkboxProps} />
      </div>
      <span
        className={
          state.checked
            ? 'flex-1 text-muted-foreground line-through focus:outline-none'
            : 'flex-1 focus:outline-none'
        }
        contentEditable={!state.readOnly}
        suppressContentEditableWarning
      >
        {props.children}
      </span>
    </PlateElement>
  );
}
