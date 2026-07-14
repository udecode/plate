import type { BaseEditor } from '@platejs/core';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleList } from './transforms';

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
    apply: ({ editor, checked }, match) => {
      editor.update.text.delete({ at: match.range });
      toggleList(editor, {
        listStyleType: KEYS.listTodo,
      });
      editor.update.nodes.set({
        checked,
        listStyleType: KEYS.listTodo,
      });

      return true;
    },
  }),
};
