import type { BaseEditor } from '@platejs/core';
import type { EditorStateView } from '@platejs/plite';

import { createRuleFactory } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { toggleList } from './transforms';

const isListInputBlocked = (
  editor: BaseEditor,
  state: Pick<EditorStateView, 'nodes'>
) =>
  state.nodes.some({
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
    enabled: ({ editor, tx }) => !isListInputBlocked(editor, tx),
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
