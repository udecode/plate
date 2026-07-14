import type { BaseEditor } from '@platejs/core';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleList } from './transforms';

const isListInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

const getOrderedListPattern = (variant: '.' | ')') =>
  new RegExp(`^\\d+\\${variant}$`);

export const OrderedListRules = {
  markdown: createRuleFactory<{}, { variant: '.' | ')' }>({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ variant }) => getOrderedListPattern(variant),
    apply: ({ editor, tx }, match) => {
      tx.text.delete({ at: match.range });
      toggleList(editor, tx, {
        type: editor.getType(KEYS.olClassic),
      });

      return true;
    },
  }),
};
