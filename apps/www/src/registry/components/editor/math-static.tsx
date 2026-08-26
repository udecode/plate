import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  getEquationHtml,
} from '@platejs/math';

import '@platejs/math/katex.css';
import { RadicalIcon } from 'lucide-react';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { inlineSuggestionVariants } from '@/registry/lib/inline-suggestion';

export function EquationElementStatic(
  props: PliteElementProps<typeof BaseEquationPlugin>
) {
  const { element } = props;

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
    <PliteElement className="my-1" {...props}>
      <div
        className={cn(
          'group flex select-none items-center justify-center rounded-sm hover:bg-primary/10 data-[selected=true]:bg-primary/10',
          element.latex.length === 0 ? 'bg-muted p-3 pr-9' : 'px-2 py-1'
        )}
      >
        {element.latex.length > 0 ? (
          <span
            // oxlint-disable-next-line react/no-danger -- [P0 behavior-boundary] KaTeX generates this HTML with trust disabled from the adjacent equation source.
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        ) : (
          <div className="flex h-7 w-full items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
            <RadicalIcon className="size-6 text-muted-foreground/80" />
            <div>Add a Tex equation</div>
          </div>
        )}
      </div>
      {props.children}
    </PliteElement>
  );
}

export function InlineEquationElementStatic(
  props: PliteElementProps<typeof BaseInlineEquationPlugin>
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
    <PliteElement
      {...props}
      className="inline-block rounded-sm select-none [&_.katex-display]:my-0"
    >
      <div
        className={cn(
          'after:-top-0.5 after:-left-1 after:absolute after:inset-0 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
          'h-6',
          inlineSuggestionVariants(),
          props.element.latex.length === 0 &&
            'text-muted-foreground after:bg-neutral-500/10'
        )}
      >
        <span
          className={cn(
            props.element.latex.length === 0 && 'hidden',
            'font-mono leading-none'
          )}
          // oxlint-disable-next-line react/no-danger -- [P0 behavior-boundary] KaTeX generates this HTML with trust disabled from the adjacent equation source.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {props.children}
    </PliteElement>
  );
}

/**
 * DOCX-compatible block equation component.
 * Displays LaTeX source code with styling.
 */
export function EquationElementDocx(
  props: PliteElementProps<typeof BaseEquationPlugin>
) {
  const { element } = props;

  if (!element.latex || element.latex.length === 0) {
    return (
      <PliteElement {...props}>
        <p style={{ color: '#888', fontStyle: 'italic' }}>[Empty equation]</p>
        {props.children}
      </PliteElement>
    );
  }

  return (
    <PliteElement {...props}>
      <p
        style={{
          fontFamily: 'Cambria Math, Consolas, monospace',
          fontSize: '12pt',
          margin: '8pt 0',
          textAlign: 'center',
        }}
      >
        {element.latex}
      </p>
      {props.children}
    </PliteElement>
  );
}

/**
 * DOCX-compatible inline equation component.
 * Displays LaTeX source code inline.
 */
export function InlineEquationElementDocx(
  props: PliteElementProps<typeof BaseInlineEquationPlugin>
) {
  const { element } = props;

  if (!element.latex || element.latex.length === 0) {
    return (
      <PliteElement {...props} as="span">
        <span style={{ color: '#888', fontStyle: 'italic' }}>[equation]</span>
        {props.children}
      </PliteElement>
    );
  }

  return (
    <PliteElement {...props} as="span">
      <span
        style={{
          fontFamily: 'Cambria Math, Consolas, monospace',
        }}
      >
        {element.latex}
      </span>
      {props.children}
    </PliteElement>
  );
}

export const BaseMathKit = [
  BaseInlineEquationPlugin.configure({
    component: InlineEquationElementStatic,
  }),
  BaseEquationPlugin.configure({
    component: EquationElementStatic,
  }),
] as const;
