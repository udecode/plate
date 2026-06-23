import type { Editor as SlateV2Editor, Range } from '@platejs/slate';

import type { BlockFenceInputRuleMatch, SlateEditor } from 'platejs';

import { createRuleFactory, KEYS, matchDelimitedInline } from 'platejs';

import type { EquationConfig } from './BaseEquationPlugin';
import type { InlineEquationConfig } from './BaseInlineEquationPlugin';

const INLINE_BOUNDARY_RE = /[\s([{'"`]/;
const INLINE_FOLLOW_RE = /[\s)\]}:;,.!?'"`]/;

const isEquationInputBlocked = (editor: SlateEditor) =>
  (editor as unknown as SlateV2Editor).read((state) => {
    const blockedTypes = new Set(
      [
        editor.getType(KEYS.codeBlock),
        editor.getType(KEYS.equation),
        editor.getType(KEYS.inlineEquation),
      ].filter((type): type is string => typeof type === 'string')
    );

    return state.nodes.some({
      match: (node) => {
        const type =
          typeof node === 'object' && node !== null && 'type' in node
            ? (node as { type?: unknown }).type
            : undefined;

        return typeof type === 'string' && blockedTypes.has(type);
      },
    });
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
  >((options) => {
    const enabled = (input: { editor: SlateEditor }) =>
      !isEquationInputBlocked(input.editor) &&
      (typeof options.enabled !== 'function' ||
        options.enabled(input as never) !== false);

    return options.variant === '$$'
      ? ({
          type: 'blockFence',
          fence: '$$',
          block: KEYS.p,
          on: options.on,
          enabled,
          priority: 100,
          apply: ({ editor }, match) => {
            const blockMatch = match as BlockFenceInputRuleMatch;

            editor.update<EquationConfig['tx']>((tx) => {
              tx.nodes.remove({ at: blockMatch.path });
              tx.equation.insert({
                at: blockMatch.path,
                select: true,
              });
            });

            return true;
          },
        } as const)
      : ({
          type: 'insertText',
          enabled,
          trigger: '$',
          resolve: (context) => {
            if (context.text !== '$' || context.options?.at) {
              return;
            }

            return getInlineEquationMatch(context);
          },
          apply: ({ editor }, match) => {
            const inlineMatch = match as {
              deleteRange: Range;
              texExpression: string;
            };

            editor.update<InlineEquationConfig['tx']>((tx) => {
              tx.text.delete({
                at: inlineMatch.deleteRange,
              });
              tx.selection.set(inlineMatch.deleteRange.anchor);
              tx.inlineEquation.insert(inlineMatch.texExpression);
            });

            return true;
          },
        } as const);
  }),
};
