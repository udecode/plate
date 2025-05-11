'use client';

import * as React from 'react';

import type { TTodoListItemElement } from '@udecode/plate-list';
import type { PlateElementProps } from '@udecode/plate/react';

import {
  useTodoListElement,
  useTodoListElementState,
} from '@udecode/plate-list/react';
import { PlateElement } from '@udecode/plate/react';

import { Checkbox } from '@/components/ui/checkbox';

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
