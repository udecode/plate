import type { BaseEditor } from '@platejs/core';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleListWithTx } from './transforms';

const isListInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

export const BulletedListRules = {
  markdown: createRuleFactory<{}, { variant: '*' | '-' }>({
    type: 'blockStart',
    variant: '-',
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ variant }) => variant,
    apply: ({ editor, tx }, match) => {
      tx.text.delete({ at: match.range });
      toggleListWithTx(editor, tx, {
        listStyleType: KEYS.ul,
      });

      return true;
    },
  }),
};
