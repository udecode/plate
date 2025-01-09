import React from 'react';

import type { SlateRenderElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';

import { CheckboxStatic } from './checkbox-static';

export const TodoMarkerStatic = ({
  element,
}: Omit<SlateRenderElementProps, 'children'>) => {
  return (
    <div contentEditable={false}>
      <CheckboxStatic
        className="pointer-events-none absolute -left-6 top-1"
        checked={element.checked as boolean}
      />
    </div>
  );
};

export const TodoLiStatic = ({
  children,
  element,
}: SlateRenderElementProps) => {
  return (
    <li
      className={cn(
        'list-none',
        (element.checked as boolean) && 'text-muted-foreground line-through'
      )}
      // deserialize
      // data-slate-checked={element.checked}
      // data-slate-indent={element.indent}
      // data-slate-list-start={element.listStart}
      // data-slate-list-style-type={element.listStyleType}
    >
      {children}
    </li>
  );
};
