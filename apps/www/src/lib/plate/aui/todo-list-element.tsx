import React from 'react';
import { PlateElement } from '@udecode/plate';
import { PlateElementProps, Value } from '@udecode/plate-common';
import { TTodoListItemElement } from '@udecode/plate-list';

import {
  useTodoListElement,
  useTodoListElementState,
} from '@/lib/@/useTodoListElement';
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
  const { inputProps } = useTodoListElement(state);

  return (
    <PlateElement className={cn('flex flex-row py-1', className)} {...props}>
      <div
        className="mr-1.5 flex select-none items-center justify-center"
        contentEditable={false}
      >
        <input className="m-0 h-4 w-4" type="checkbox" {...inputProps} />
      </div>
      <span
        className={cn(
          'flex-1 focus:outline-none',
          state.checked && 'line-through opacity-[0.666]'
        )}
        contentEditable={!state.readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </PlateElement>
  );
}
