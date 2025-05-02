import React from 'react';

import type { SlateElementProps } from '@udecode/plate';
import type { TCodeBlockElement } from '@udecode/plate-code-block';

import { cn } from '@udecode/cn';
import { SlateElement } from '@udecode/plate';

export const CodeBlockElementStatic = ({
  children,
  className,
  ...props
}: SlateElementProps<TCodeBlockElement>) => {
  return (
    <SlateElement
      className={cn(
        className,
        'py-1',
        '**:[.hljs-comment,.hljs-code,.hljs-formula]:text-[#6a737d]',
        '**:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_]:text-[#d73a49]',
        '**:[.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_]:text-[#6f42c1]',
        '**:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-[#005cc5]',
        '**:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-[#032f62]',
        '**:[.hljs-built_in,.hljs-symbol]:text-[#e36209]',
        '**:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-[#22863a]',
        '**:[.hljs-emphasis]:italic',
        '**:[.hljs-strong]:font-bold',
        '**:[.hljs-section]:font-bold **:[.hljs-section]:text-[#005cc5]',
        '**:[.hljs-bullet]:text-[#735c0f]',
        '**:[.hljs-addition]:bg-[#f0fff4] **:[.hljs-addition]:text-[#22863a]',
        '**:[.hljs-deletion]:bg-[#ffeef0] **:[.hljs-deletion]:text-[#b31d28]'
      )}
      {...props}
    >
      <div className="relative rounded-md bg-muted/50">
        <pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
          <code>{children}</code>
        </pre>
      </div>
    </SlateElement>
  );
};
