'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { NodeApi } from '@udecode/plate';
import { formatCodeBlock, isLangSupported } from '@udecode/plate-code-block';
import { PlateElement } from '@udecode/plate/react';
import { BracesIcon, CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from './button';
import { CodeBlockCombobox } from './code-block-combobox';

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { editor, element } = props;

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
        <div className="relative rounded-md bg-muted/50">
          <pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
            <code>{children}</code>
          </pre>

          <div className="absolute top-1 right-1 z-10 flex gap-0.5 select-none">
            {isLangSupported(element.lang as string) && (
              <Button
                size="icon"
                variant="ghost"
                className="size-6 text-xs"
                onClick={() => formatCodeBlock(editor, { element })}
                title="Format code"
              >
                <BracesIcon className="!size-3.5 text-muted-foreground" />
              </Button>
            )}

            <CodeBlockCombobox />

            <CopyButton
              size="icon"
              variant="ghost"
              className="size-6 gap-1 text-xs text-muted-foreground"
              value={() => NodeApi.string(element)}
            />
          </div>
        </div>
      </PlateElement>
    );
  }
);

function CopyButton({
  showLabel = false,
  value,
  ...props
}: { value: (() => string) | string; showLabel?: boolean } & Omit<
  React.ComponentProps<typeof Button>,
  'value'
>) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      onClick={() => {
        void navigator.clipboard.writeText(
          typeof value === 'function' ? value() : value
        );
        setHasCopied(true);
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <CheckIcon className="!size-3" />
      ) : (
        <CopyIcon className="!size-3" />
      )}
    </Button>
  );
}
