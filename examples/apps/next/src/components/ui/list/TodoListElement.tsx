import React from 'react';
import { findNodePath, setNodes, Value } from '@udecode/plate-common';
import { TTodoListItemElement } from '@udecode/plate-list';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';
import { useReadOnly } from 'slate-react';

export type TodoListElementProps = PlateElementProps<
  Value,
  TTodoListItemElement
>;

export function TodoListElement({ className, ...props }: TodoListElementProps) {
  const { children, element, editor } = props;

  const readOnly = useReadOnly();

  const { checked } = element;

  return (
    <PlateElement className={cn('flex flex-row py-1', className)} {...props}>
      <div
        contentEditable={false}
        className="mr-1.5 flex select-none items-center justify-center"
      >
        <input
          data-testid="TodoListElementCheckbox"
          className="m-0 h-4 w-4"
          type="checkbox"
          checked={!!checked}
          onChange={(e) => {
            if (readOnly) return;
            const path = findNodePath(editor, element);
            if (!path) return;

            setNodes<TTodoListItemElement>(
              editor,
              { checked: e.target.checked },
              {
                at: path,
              }
            );
          }}
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
