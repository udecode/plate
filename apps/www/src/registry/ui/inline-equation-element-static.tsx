import * as React from 'react';

import type { SlateElementProps } from '@udecode/plate';
import type { TEquationElement } from '@udecode/plate-math';

import { SlateElement } from '@udecode/plate';
import { getEquationHtml } from '@udecode/plate-math';

import { cn } from '@/lib/utils';

export function InlineEquationElementStatic(
  props: SlateElementProps<TEquationElement>
) {
  const html = getEquationHtml({
    element: props.element,
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
      {...props}
      className="inline-block rounded-sm select-none [&_.katex-display]:my-0"
    >
      <div
        className={cn(
          'after:absolute after:inset-0 after:-top-0.5 after:-left-1 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
          'h-6',
          props.element.texExpression.length === 0 &&
            'text-muted-foreground after:bg-neutral-500/10'
        )}
      >
        <span
          className={cn(
            props.element.texExpression.length === 0 && 'hidden',
            'font-mono leading-none'
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {props.children}
    </SlateElement>
  );
}
