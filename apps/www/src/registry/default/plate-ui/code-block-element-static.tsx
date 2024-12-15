import React from 'react';

import type { TCodeBlockElement } from '@udecode/plate-code-block';
import type { PlateElementStaticProps } from '@udecode/plate-common';

import { cn } from '@udecode/cn';
import { PlateElementStatic } from '@udecode/plate-common';

export const CodeBlockElementStatic = ({
  children,
  ...props
}: PlateElementStaticProps<TCodeBlockElement>) => {
  const { element } = props;

  const codeClassName = element?.lang
    ? `${element.lang} language-${element.lang}`
    : '';

  return (
    <PlateElementStatic
      className={cn('relative py-1', codeClassName)}
      {...props}
    >
      <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 font-mono text-sm leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>
    </PlateElementStatic>
  );
};
