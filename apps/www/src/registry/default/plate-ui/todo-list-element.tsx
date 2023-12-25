import React from 'react';
import { PlateElement } from '@udecode/plate-common';
import {
  useTodoListElement,
  useTodoListElementState,
} from '@udecode/plate-list';

import { cn, withRef } from '@/lib/utils';

import { Checkbox } from './checkbox';

export const TodoListElement = withRef(
  PlateElement,
  ({ className, children, ...props }, ref) => {
    const { element } = props;
    const state = useTodoListElementState({ element });
    const { checkboxProps } = useTodoListElement(state);

    return (
      <PlateElement
        ref={ref}
        className={cn('flex flex-row py-1', className)}
        {...props}
      >
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
);
