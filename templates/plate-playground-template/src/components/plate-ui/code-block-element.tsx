'use client';

import './code-block-element.css';

import React, { forwardRef } from 'react';
import { cn } from '@udecode/cn';
import {
  TCodeBlockElement,
  useCodeBlockElementState,
} from '@udecode/plate-code-block';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';

import { CodeBlockCombobox } from './code-block-combobox';

const CodeBlockElement = forwardRef<
  HTMLDivElement,
  PlateElementProps<Value, TCodeBlockElement>
>(({ className, ...props }, ref) => {
  const { children, element } = props;

  const state = useCodeBlockElementState({ element });

  return (
    <PlateElement
      ref={ref}
      className={cn('relative py-1', state.className, className)}
      {...props}
    >
      <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>

      {state.syntax && (
        <div
          className="absolute right-2 top-2 z-10 select-none"
          contentEditable={false}
        >
          <CodeBlockCombobox />
        </div>
      )}
    </PlateElement>
  );
});
CodeBlockElement.displayName = 'CodeBlockElement';

export { CodeBlockElement };
