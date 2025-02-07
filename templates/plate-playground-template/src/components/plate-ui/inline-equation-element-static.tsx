import React from 'react';

import type { TEquationElement } from '@udecode/plate-math';

import { cn } from '@udecode/cn';
import { type SlateElementProps, SlateElement } from '@udecode/plate';
import { getEquationHtml } from '@udecode/plate-math';

export function InlineEquationElementStatic({
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
    <SlateElement
      className={cn(
        'inline-block rounded-sm select-none [&_.katex-display]:my-0',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'after:absolute after:inset-0 after:-top-0.5 after:-left-1 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
          'h-6',
          element.texExpression.length === 0 &&
            'text-muted-foreground after:bg-neutral-500/10',
          className
        )}
      >
        <span
          className={cn(
            element.texExpression.length === 0 && 'hidden',
            'font-mono leading-none'
          )}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </div>
      {children}
    </SlateElement>
  );
}
