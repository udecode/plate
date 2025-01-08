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
  const { element } = props;

  const state = {
    className: element?.lang ? `${element.lang} language-${element.lang}` : '',
  };

  return (
    <SlateElement className={cn(className, 'py-1', state.className)} {...props}>
      <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>
    </SlateElement>
  );
};
