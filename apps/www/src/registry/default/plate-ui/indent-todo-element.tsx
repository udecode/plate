import { cn, withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate-common';
import {
  TIndentTodoListItemElement,
  useIndentTodoListElement,
  useIndentTodoListElementState,
} from '@udecode/plate-indent-todo';

import { Checkbox } from './checkbox';

export const IndentTodoElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement<TIndentTodoListItemElement>();
    const state = useIndentTodoListElementState({ element });
    const { checkboxProps } = useIndentTodoListElement(state);

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
