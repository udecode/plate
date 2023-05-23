'use client';

import '@/styles/prismjs.css';
import React, { forwardRef, useEffect, useState } from 'react';
import {
  CodeBlockPlugin,
  ELEMENT_CODE_BLOCK,
  TCodeBlockElement,
} from '@udecode/plate-code-block';
import {
  findNodePath,
  getPluginOptions,
  setNodes,
  Value,
} from '@udecode/plate-common';
import { cn, PlateElement, PlateElementProps } from '@udecode/plate-tailwind';
import { CodeBlockSelectElement } from './CodeBlockSelectElement';

const CodeBlockElement = forwardRef<
  HTMLDivElement,
  PlateElementProps<Value, TCodeBlockElement>
>(({ className, ...props }, ref) => {
  const { children, element, editor } = props;
  const { lang } = element;
  const [domLoaded, setDomLoaded] = useState(false);

  const { syntax } = getPluginOptions<CodeBlockPlugin>(
    editor,
    ELEMENT_CODE_BLOCK
  );
  const codeClassName = lang ? `${lang} language-${lang}` : '';

  useEffect(() => {
    setDomLoaded(true);
  }, []);

  return (
    <PlateElement
      ref={ref}
      className={cn('relative', domLoaded && codeClassName, className)}
      {...props}
    >
      <pre className="overflow-x-auto rounded-[3px] bg-[rgb(247,246,243)] px-4 py-3 font-[SFMono-Regular,_Consolas,_Monaco,_'Liberation_Mono',_Menlo,_Courier,_monospace] text-[16px] leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>

      {syntax && (
        <div className="absolute right-0 top-0 z-10 px-4 py-3">
          <CodeBlockSelectElement
            data-testid="CodeBlockSelectElement"
            lang={lang}
            onChange={(val: string) => {
              const path = findNodePath(editor, element);
              path &&
                setNodes<TCodeBlockElement>(
                  editor,
                  { lang: val },
                  { at: path }
                );
            }}
          />
        </div>
      )}
    </PlateElement>
  );
});
CodeBlockElement.displayName = 'CodeBlockElement';

export { CodeBlockElement };
