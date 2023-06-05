'use client';

import './code-block-element.css';
import React, { forwardRef } from 'react';
import {
  TCodeBlockElement,
  useCodeBlockElementState,
} from '@udecode/plate-code-block';
import { PlateElement, PlateElementProps, Value } from '@udecode/plate-common';
import { CodeBlockSelectElement } from './code-block-select-element';

import { cn } from '@/lib/utils';

const CodeBlockElement = forwardRef<
  HTMLDivElement,
  PlateElementProps<Value, TCodeBlockElement>
>(({ className, ...props }, ref) => {
  const { children, element } = props;

  const state = useCodeBlockElementState({ element });

  return (
    <PlateElement
      ref={ref}
      className={cn('relative', state.className, className)}
      {...props}
    >
      <pre className="overflow-x-auto rounded-[3px] bg-[rgb(247,246,243)] px-4 py-3 font-[SFMono-Regular,_Consolas,_Monaco,_'Liberation_Mono',_Menlo,_Courier,_monospace] text-[16px] leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>

      {state.syntax && (
        <div
          className="absolute right-0 top-0 z-10 select-none px-4 py-3"
          contentEditable={false}
        >
          <CodeBlockSelectElement />
        </div>
      )}
    </PlateElement>
  );
});
CodeBlockElement.displayName = 'CodeBlockElement';

export { CodeBlockElement };
