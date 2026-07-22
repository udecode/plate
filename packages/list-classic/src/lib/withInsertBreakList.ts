import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import { editorCommands } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListPluginOptions } from './BaseListPlugin';

import { getListItemEntry } from './queries/getListItemEntry';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';

export const withInsertBreakList = ({
  editor,
  getOptions,
}: {
  editor: BaseEditor;
  getOptions: () => ListPluginOptions;
}): PlateEditorExtension => ({
  priority: 100,
  commands: ({ around }) => [
    around(editorCommands.insertBreak, ({ state, next }) => {
      let handled = false;
      const prefix = state.transaction((tx) => {
        const selection = tx.selection();

        if (!selection) return;

        const res = getListItemEntry(editor, { at: selection }, tx);

        if (res) {
          const block = tx.nodes.block();

          if (
            block &&
            tx.nodes.isEmpty(block[0]) &&
            moveListItemUp(editor, tx, res)
          ) {
            handled = true;
            return;
          }
        }

        const listItem = tx.nodes.above({
          match: { type: editor.getType(KEYS.li) },
        });

        if (listItem && tx.text.string(listItem[1]) === '') {
          tx.nodes.replace(
            {
              children: [{ text: '' }],
              type: editor.getType(KEYS.p),
            },
            { at: listItem[1], select: true }
          );
          handled = true;
          return;
        }

        handled = insertListItem(editor, tx, getOptions());
      });

      return handled ? prefix : next.after(prefix);
    }),
  ],
});
