import type { BlockFenceInputRuleMatch, BasePlateEditor } from 'platejs';

import { createRuleFactory, KEYS } from 'platejs';

import type { insertEmptyCodeBlock } from './transforms';

const isCodeBlockInputBlocked = (editor: BasePlateEditor) =>
  editor.api.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

const insertCodeBlockAtPath = (
  editor: Parameters<typeof insertEmptyCodeBlock>[0],
  path: number[]
) => {
  editor.update((tx) => {
    tx.nodes.remove({ at: path });
    tx.nodes.insert(
      {
        children: [
          {
            children: [{ text: '' }],
            type: editor.getType(KEYS.codeLine),
          },
        ],
        type: editor.getType(KEYS.codeBlock),
      },
      { at: path }
    );
  });

  const start = editor.api.start([...path, 0]);

  if (start) {
    editor.update((tx) => {
      tx.selection.set({ anchor: start, focus: start });
    });
  }
};

export const CodeBlockRules = {
  markdown: createRuleFactory<
    { on: 'break' | 'match' },
    { block: string; fence: string },
    BlockFenceInputRuleMatch
  >({
    type: 'blockFence',
    fence: '```',
    block: KEYS.p,
    enabled: ({ editor }) => !isCodeBlockInputBlocked(editor),
    priority: 100,
    apply: ({ editor, on }, match) => {
      if (on === 'break') {
        insertCodeBlockAtPath(editor, match.path);
      } else {
        insertCodeBlockAtPath(editor, match.path);
      }

      return true;
    },
  }),
};
