import type { BasePlateEditor } from 'platejs';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleList } from './transforms';

const isListInputBlocked = (editor: BasePlateEditor) =>
  editor.api.some({
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
      editor.update((tx) => {
        tx.text.delete({ at: match.range });
      });
      toggleList(editor, {
        listStyleType: KEYS.listTodo,
      });
      editor.update((tx) => {
        tx.nodes.set({
          checked,
          listStyleType: KEYS.listTodo,
        });
      });

      return true;
    },
  }),
};
