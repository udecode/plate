import React from 'react';

import type { TCodeBlockElement } from '@udecode/plate-code-block';
import type { StaticElementProps } from '@udecode/plate-common';

import { PlateStaticElement } from '@udecode/plate-common';

import { cn } from '../lib/utils';

export const CodeBlockElementStatic = ({
  children,
  element,
  ...props
}: StaticElementProps<TCodeBlockElement>) => {
  const codeClassName = element?.lang
    ? `${element.lang} language-${element.lang}`
    : '';

  return (
    <PlateStaticElement
      className={cn('relative py-1', codeClassName)}
      {...props}
      element={element}
    >
      <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>
    </PlateStaticElement>
  );
};
