'use client';

import React from 'react';

import type { Editor, TElement } from '@udecode/plate';

import { cn, withRef } from '@udecode/cn';
import { formatCodeBlock, isLangSupported } from '@udecode/plate-code-block';
import { PlateElement } from '@udecode/plate/react';
import { BracesIcon } from 'lucide-react';

import { Button } from './button';
import { CodeBlockCombobox } from './code-block-combobox';

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement
        ref={ref}
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
        <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] text-[#24292e] [tab-size:2]">
          <code>{children}</code>
        </pre>

        <div
          className="absolute top-2 right-2 z-10 flex items-center gap-1 select-none"
          contentEditable={false}
        >
          <CodeBlockFormatButton {...props} />
          <CodeBlockCombobox />
        </div>
      </PlateElement>
    );
  }
);

export function CodeBlockFormatButton({
  editor,
  element,
}: {
  editor: Editor;
  element: TElement;
}) {
  if (!isLangSupported(element.lang as string)) {
    return null;
  }

  return (
    <Button
      size="xs"
      variant="ghost"
      className="h-5 justify-between px-1 text-xs"
      onClick={() => formatCodeBlock(editor, { element })}
      title="Format code"
    >
      <BracesIcon className="text-gray-500" />
    </Button>
  );
}
