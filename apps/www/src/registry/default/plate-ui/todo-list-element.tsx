import React from 'react';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import {
  TTodoListItemElement,
  useTodoListElement,
  useTodoListElementState,
} from '@udecode/plate-list';
import { Checkbox } from './checkbox';

import { cn } from '@/lib/utils';

export type TodoListElementProps = PlateElementProps<
  Value,
  TTodoListItemElement
>;

export function TodoListElement({
  className,
  children,
  ...props
}: TodoListElementProps) {
  const { element } = props;
  const state = useTodoListElementState({ element });
  const { checkboxProps } = useTodoListElement(state);

  return (
    <PlateElement className={cn('flex flex-row py-1', className)} {...props}>
      <div
        className="mr-1.5 flex select-none items-center justify-center"
        contentEditable={false}
      >
        <Checkbox {...checkboxProps} />
      </div>
      <span
        className={cn(
          'flex-1 focus:outline-none',
          state.checked && 'text-muted-foreground line-through'
        )}
        contentEditable={!state.readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </PlateElement>
  );
}
