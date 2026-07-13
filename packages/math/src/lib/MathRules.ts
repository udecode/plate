import type { BaseEditor, BlockFenceInputRuleMatch } from '@platejs/core';
import { createRuleFactory, matchDelimitedInline } from '@platejs/core';
import type { Range } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { insertEquation, insertInlineEquation } from './transforms';

const INLINE_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

const isEquationInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
    match: {
      type: [
        editor.getType(KEYS.codeBlock),
        editor.getType(KEYS.equation),
        editor.getType(KEYS.inlineEquation),
      ],
    },
  });

const getInlineEquationMatch = (
  context: Parameters<typeof matchDelimitedInline>[0]
):
  | {
      deleteRange: Range;
      texExpression: string;
    }
  | undefined => {
  const match = matchDelimitedInline(context, {
    boundaryRe: INLINE_BOUNDARY_RE,
    followRe: INLINE_FOLLOW_RE,
    open: '$',
    requireClosingDelimiter: false,
    trim: 'reject',
  });

  if (!match) return;

  return {
    deleteRange: match.deleteRange,
    texExpression: match.content,
  };
};

export const MathRules = {
  markdown: createRuleFactory<
    { variant: '$' } | { on: 'break' | 'match'; variant: '$$' }
  >((options) =>
    options.variant === '$$'
      ? {
          type: 'blockFence',
          fence: '$$',
          block: KEYS.p,
          on: options.on,
          enabled: (context) =>
            (options.enabled?.(context) ?? true) &&
            !isEquationInputBlocked(context.editor),
          priority: 100,
          apply: ({ editor, tx }, match) => {
            const blockMatch = match as BlockFenceInputRuleMatch;

            tx.nodes.remove({ at: blockMatch.path });
            insertEquation(tx, editor.getType(KEYS.equation), {
              at: blockMatch.path,
              select: true,
            });

            return true;
          },
        }
      : {
          type: 'insertText',
          enabled: (context) =>
            (options.enabled?.(context) ?? true) &&
            !isEquationInputBlocked(context.editor),
          trigger: '$',
          resolve: (context) => {
            if (context.text !== '$' || context.options?.at) {
              return;
            }

            return getInlineEquationMatch(context);
          },
          apply: ({ editor, tx }, match) => {
            const inlineMatch = match as {
              deleteRange: Range;
              texExpression: string;
            };

            tx.text.delete({
              at: inlineMatch.deleteRange,
            });
            tx.selection.set(inlineMatch.deleteRange.anchor);
            insertInlineEquation(tx, editor.getType(KEYS.inlineEquation), {
              texExpression: inlineMatch.texExpression,
            });

            return true;
          },
        }
  ),
};
