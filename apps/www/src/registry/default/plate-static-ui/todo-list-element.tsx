'use client';

import React from 'react';

import type { StaticElementProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateStaticElement } from '@udecode/plate-common';

import { StaticCheckbox } from './checkbox';

export function TodoListElement({
  children,
  className,
  element,
  ...props
}: StaticElementProps) {
  console.log(element, 'fj');

  return (
    <PlateStaticElement
      className={cn('flex flex-row py-1', className)}
      element={element}
      {...props}
    >
      <div
        className="mr-1.5 flex select-none items-center justify-center"
        contentEditable={false}
      >
        <StaticCheckbox />
      </div>
      <span
        className={cn(
          'flex-1 focus:outline-none'
          // state.checked && 'text-muted-foreground line-through'
        )}
        // contentEditable={!state.readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </PlateStaticElement>
  );
}
