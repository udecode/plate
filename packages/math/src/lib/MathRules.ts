import type { BlockFenceInputRuleMatch, SlateEditor, TRange } from 'platejs';

import { createRuleFactory, KEYS, matchDelimitedInline } from 'platejs';

import { insertEquation, insertInlineEquation } from './transforms';

const INLINE_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

const isEquationInputBlocked = (editor: SlateEditor) =>
  editor.api.some({
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
      deleteRange: TRange;
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
          enabled: ({ editor }) => !isEquationInputBlocked(editor),
          priority: 100,
          apply: ({ editor }, match) => {
            const blockMatch = match as BlockFenceInputRuleMatch;

            editor.tf.removeNodes({ at: blockMatch.path });
            insertEquation(editor, {
              at: blockMatch.path,
              select: true,
            });

            return true;
          },
        }
      : {
          type: 'insertText',
          enabled: ({ editor }) => !isEquationInputBlocked(editor),
          trigger: '$',
          resolve: (context) => {
            if (context.text !== '$' || context.options?.at) {
              return;
            }

            return getInlineEquationMatch(context);
          },
          apply: ({ editor }, match) => {
            const inlineMatch = match as {
              deleteRange: TRange;
              texExpression: string;
            };

            editor.tf.delete({
              at: inlineMatch.deleteRange,
            });
            editor.tf.select(inlineMatch.deleteRange.anchor);
            insertInlineEquation(editor, inlineMatch.texExpression);

            return true;
          },
        }
  ),
};
