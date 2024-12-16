'use client';

import type { PlateRenderElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import {
  useIndentTodoListElement,
  useIndentTodoListElementState,
} from '@udecode/plate-indent-list/react';

import { Checkbox } from './checkbox';

export const TodoMarker = ({
  element,
}: Omit<PlateRenderElementStaticProps, 'children'>) => {
  const state = useIndentTodoListElementState({ element });
  const { checkboxProps } = useIndentTodoListElement(state);

  return (
    <div contentEditable={false}>
      <Checkbox
        style={{ left: -24, position: 'absolute', top: 4 }}
        {...checkboxProps}
      />
    </div>
  );
};

export const TodoLi = (props: PlateRenderElementStaticProps) => {
  const { children, element } = props;

  return (
    <span
      className={cn(
        (element.checked as boolean) && 'text-muted-foreground line-through'
      )}
    >
      {children}
    </span>
  );
};
