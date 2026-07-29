import {
  type BlockFenceInputRuleMatch,
  createBasePlugin,
  createRuleFactory,
  matchDelimitedInline,
} from '@platejs/core';
import { type NodeInsertNodesOptions, property } from '@platejs/plite';
import { type TEquationElement, KEYS, NODES } from '@platejs/utils';
import katex, { type KatexOptions } from 'katex';

import 'katex/dist/katex.min.css';

const INLINE_EQUATION_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_EQUATION_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

export type InsertEquationOptions = NodeInsertNodesOptions<TEquationElement>;

export type InsertInlineEquationOptions =
  NodeInsertNodesOptions<TEquationElement> & {
    texExpression?: string;
  };

export const BaseEquationPlugin = createBasePlugin({
  key: KEYS.equation,
  schema: {
    element: {
      properties: { texExpression: property.string() },
      void: 'block',
    },
  },
  update: ({ tx, type }) => ({
    insert: (options?: InsertEquationOptions) => {
      tx.nodes.insert<TEquationElement>(
        {
          children: [{ text: '' }],
          texExpression: '',
          type,
        },
        options
      );
    },
  }),
});

export const BaseInlineEquationPlugin = createBasePlugin({
  key: KEYS.inlineEquation,
  schema: {
    element: {
      properties: { texExpression: property.string() },
      void: 'inline',
    },
  },
  type: NODES.inlineEquation,
  update: ({ tx, type }) => ({
    insert: ({
      texExpression,
      ...options
    }: InsertInlineEquationOptions = {}) => {
      tx.nodes.insert<TEquationElement>(
        {
          children: [{ text: '' }],
          texExpression: texExpression ?? tx.text.string(),
          type,
        },
        options
      );
    },
  }),
});

export const MathRules = (() => {
  const block = createRuleFactory<
    { on: 'break' | 'match' },
    {},
    BlockFenceInputRuleMatch
  >({
    type: 'blockFence',
    apply: ({ editor, tx }, match) => {
      tx.nodes.remove({ at: match.path });
      tx.nodes.insert<TEquationElement>(
        {
          children: [{ text: '' }],
          texExpression: '',
          type: editor.getType(KEYS.equation),
        },
        {
          at: match.path,
          select: true,
        }
      );

      return true;
    },
    block: KEYS.p,
    fence: '$$',
    on: ({ on }) => on,
    priority: 100,
  });
  const inline = createRuleFactory<
    {},
    {},
    {
      deleteRange: NonNullable<
        ReturnType<typeof matchDelimitedInline>
      >['deleteRange'];
      texExpression: string;
    }
  >({
    type: 'insertText',
    apply: ({ editor, tx }, match) => {
      tx.text.delete({
        at: match.deleteRange,
      });
      tx.selection.set(match.deleteRange.anchor);
      tx.nodes.insert<TEquationElement>({
        children: [{ text: '' }],
        texExpression: match.texExpression,
        type: editor.getType(KEYS.inlineEquation),
      });

      return true;
    },
    resolve: (context) => {
      if (context.text !== '$' || context.options?.at) return;

      const match = matchDelimitedInline(context, {
        boundaryRe: INLINE_EQUATION_BOUNDARY_RE,
        followRe: INLINE_EQUATION_FOLLOW_RE,
        open: '$',
        requireClosingDelimiter: false,
        trim: 'reject',
      });

      if (!match) return;

      return {
        deleteRange: match.deleteRange,
        texExpression: match.content,
      };
    },
    trigger: '$',
  });

  return {
    markdown: (
      options:
        | (NonNullable<Parameters<typeof inline>[0]> & { variant: '$' })
        | (Parameters<typeof block>[0] & { variant: '$$' })
    ) => {
      if (options.variant === '$$') {
        const { variant: _, ...ruleOptions } = options;
        const rule = block(ruleOptions);

        if (rule.target === 'insertBreak') {
          const enabled = rule.enabled;

          rule.enabled = (context) =>
            (enabled?.(context) ?? true) &&
            !context.editor.read.nodes.some({
              match: {
                type: [
                  context.editor.getType(KEYS.codeBlock),
                  context.editor.getType(KEYS.equation),
                  context.editor.getType(KEYS.inlineEquation),
                ],
              },
            });
        }

        if (rule.target === 'insertText') {
          const enabled = rule.enabled;

          rule.enabled = (context) =>
            (enabled?.(context) ?? true) &&
            !context.editor.read.nodes.some({
              match: {
                type: [
                  context.editor.getType(KEYS.codeBlock),
                  context.editor.getType(KEYS.equation),
                  context.editor.getType(KEYS.inlineEquation),
                ],
              },
            });
        }

        return rule;
      }

      const { variant: _, ...ruleOptions } = options;
      const rule = inline(ruleOptions);
      const enabled = rule.enabled;

      rule.enabled = (context) =>
        (enabled?.(context) ?? true) &&
        !context.editor.read.nodes.some({
          match: {
            type: [
              context.editor.getType(KEYS.codeBlock),
              context.editor.getType(KEYS.equation),
              context.editor.getType(KEYS.inlineEquation),
            ],
          },
        });

      return rule;
    },
  };
})();

export const getEquationHtml = ({
  element,
  options,
}: {
  element: TEquationElement;
  options?: KatexOptions;
}) => katex.renderToString(element.texExpression, options);
