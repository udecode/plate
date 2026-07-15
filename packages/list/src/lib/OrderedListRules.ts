import type { BaseEditor } from '@platejs/core';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleListWithTx } from './transforms';

const isListInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

const getOrderedListPattern = (variant: '.' | ')') =>
  new RegExp(`^(\\d+)${variant === ')' ? '\\)' : '\\.'}$`);

export const OrderedListRules = {
  markdown: createRuleFactory<{}, { variant: '.' | ')' }, { start: number }>({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ variant }) => getOrderedListPattern(variant),
    resolveMatch: ({ match }) => ({
      start: Number((match as RegExpMatchArray)[1]),
    }),
    apply: ({ editor, tx }, match) => {
      tx.text.delete({ at: match.range });
      toggleListWithTx(editor, tx, {
        listRestartPolite: match.start || 1,
        listStyleType: KEYS.ol,
      });

      return true;
    },
  }),
};
