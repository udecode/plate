import type { BasePlateEditor } from '@platejs/core';

import { createRuleFactory } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { toggleList } from './transforms';

const isListInputBlocked = (editor: BasePlateEditor) =>
  editor.api.some({
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
    apply: ({ editor }, match) => {
      editor.update((tx) => {
        tx.text.delete({ at: match.range });
      });
      toggleList(editor, {
        type: editor.getType(KEYS.olClassic),
      });

      return true;
    },
  }),
};
