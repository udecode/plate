import React from 'react';
import { Value } from '@udecode/plate-common';
import { TTodoListItemElement } from '@udecode/plate-list';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';

import { useTodoListElementInputProps } from '@/lib/@/useTodoListElementInputProps';
import { useTodoListElementState } from '@/lib/@/useTodoListElementState';

export type TodoListElementProps = PlateElementProps<
  Value,
  TTodoListItemElement
>;

export function TodoListElement({
  className,
  children,
  ...props
}: TodoListElementProps) {
  const { element, editor } = props;
  const { checked, readOnly } = useTodoListElementState({ element });
  const todoListElementInput = useTodoListElementInputProps({
    editor,
    element,
  });

  return (
    <PlateElement className={cn('flex flex-row py-1', className)} {...props}>
      <div
        className="mr-1.5 flex select-none items-center justify-center"
        contentEditable={false}
      >
        <input
          className="m-0 h-4 w-4"
          type="checkbox"
          {...todoListElementInput}
        />
      </div>
      <span
        className={cn(
          'flex-1 focus:outline-none',
          checked && 'line-through opacity-[0.666]'
        )}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </PlateElement>
  );
}
