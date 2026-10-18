import katex from 'katex';

import 'katex/dist/katex.min.css';
import { RadicalIcon } from 'lucide-react';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from 'platejs/math';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { cn } from '@/lib/utils';

export function EquationElementStatic(
  props: EditorElementProps<typeof BaseEquationPlugin>
) {
  const { element } = props;

  const html = katex.renderToString(element.latex, {
    displayMode: true,
    errorColor: '#cc0000',
    fleqn: false,
    leqno: false,
    macros: { '\\f': '#1f(#2)' },
    output: 'htmlAndMathml',
    strict: 'warn',
    throwOnError: false,
    trust: false,
  });

  return (
    <EditorElement className="my-1" {...props}>
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
    </EditorElement>
  );
}

export function InlineEquationElementStatic(
  props: EditorElementProps<typeof BaseInlineEquationPlugin>
) {
  const html = katex.renderToString(props.element.latex, {
    displayMode: true,
    errorColor: '#cc0000',
    fleqn: false,
    leqno: false,
    macros: { '\\f': '#1f(#2)' },
    output: 'htmlAndMathml',
    strict: 'warn',
    throwOnError: false,
    trust: false,
  });

  return (
    <EditorElement
      {...props}
      className="inline-block rounded-sm select-none [&_.katex-display]:my-0"
    >
      <div
        className={cn(
          'after:-top-0.5 after:-left-1 after:absolute after:inset-0 after:z-1 after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
          'h-6',
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
    </EditorElement>
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
