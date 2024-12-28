import React from 'react';

import type { TEquationElement } from '@udecode/plate-math';

import { cn } from '@udecode/cn';
import { type SlateElementProps, SlateElement } from '@udecode/plate-common';
import { getEquationHtml } from '@udecode/plate-math';

export function EquationElementStatic({
  children,
  className,
  ...props
}: SlateElementProps) {
  const element = props.element as TEquationElement;

  const html = getEquationHtml({
    element,
    options: {
      displayMode: true,
      errorColor: '#cc0000',
      fleqn: false,
      leqno: false,
      macros: { '\\f': '#1f(#2)' },
      output: 'htmlAndMathml',
      strict: 'warn',
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <SlateElement className={cn('relative my-1', className)} {...props}>
      <div
        className={cn(
          'flex select-none items-center justify-center rounded-sm',
          element.texExpression.length === 0 ? 'bg-muted p-3' : 'px-2 py-1'
        )}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </div>
      {children}
    </SlateElement>
  );
}
