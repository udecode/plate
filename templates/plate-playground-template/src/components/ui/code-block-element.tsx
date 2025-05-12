'use client';

import * as React from 'react';

import { NodeApi } from '@udecode/plate';
import {
  type TCodeBlockElement,
  formatCodeBlock,
  isLangSupported,
} from '@udecode/plate-code-block';
import { type PlateElementProps, PlateElement } from '@udecode/plate/react';
import { BracesIcon, CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CodeBlockCombobox } from './code-block-combobox';

export function CodeBlockElement(props: PlateElementProps<TCodeBlockElement>) {
  const { editor, element } = props;

  return (
    <PlateElement
      className="py-1 **:[.hljs-addition]:bg-[#f0fff4] **:[.hljs-addition]:text-[#22863a] **:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-[#005cc5] **:[.hljs-built_in,.hljs-symbol]:text-[#e36209] **:[.hljs-bullet]:text-[#735c0f] **:[.hljs-comment,.hljs-code,.hljs-formula]:text-[#6a737d] **:[.hljs-deletion]:bg-[#ffeef0] **:[.hljs-deletion]:text-[#b31d28] **:[.hljs-emphasis]:italic **:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_]:text-[#d73a49] **:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-[#22863a] **:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-[#032f62] **:[.hljs-section]:font-bold **:[.hljs-section]:text-[#005cc5] **:[.hljs-strong]:font-bold **:[.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_]:text-[#6f42c1]"
      {...props}
    >
      <div className="relative rounded-md bg-muted/50">
        <pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
          <code>{props.children}</code>
        </pre>

        <div
          className="absolute top-1 right-1 z-10 flex gap-0.5 select-none"
          contentEditable={false}
        >
          {isLangSupported(element.lang) && (
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

function CopyButton({
  value,
  ...props
}: { value: (() => string) | string } & Omit<
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
