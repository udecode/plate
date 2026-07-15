import type { BaseEditor } from '@platejs/core';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleListWithTx } from './transforms';

const isListInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

export const TaskListRules = {
  markdown: createRuleFactory<{}, { checked: boolean }>({
    type: 'blockStart',
    checked: false,
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ editor, checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      toggleListWithTx(editor, tx, {
        listStyleType: KEYS.listTodo,
      });
      tx.nodes.set({
        checked,
        listStyleType: KEYS.listTodo,
      });

      return true;
    },
  }),
};
