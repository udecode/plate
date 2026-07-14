import type { ExtendPlateEditorExtension } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from './BaseListPlugin';

import { getListItemEntry } from './queries/getListItemEntry';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';

export const withInsertBreakList: ExtendPlateEditorExtension<ListConfig> = ({
  editor,
  getOptions,
}) => ({
  priority: 100,
  transforms: {
    insertBreak({ next, tx }) {
      if (!editor.read.selection()) return next();

      const res = getListItemEntry(editor, {});

      if (res) {
        const block = editor.read.nodes.block();

        if (
          block &&
          editor.read.nodes.isEmpty(block[0]) &&
          moveListItemUp(editor, tx, res)
        )
          return true;
      }

      const listItem = editor.read.nodes.above({
        match: { type: editor.getType(KEYS.li) },
      });

      if (listItem && editor.read.text.string(listItem[1]) === '') {
        tx.nodes.replace(
          {
            children: [{ text: '' }],
            type: editor.getType(KEYS.p),
          },
          { at: listItem[1], select: true }
        );
        return true;
      }

      if (insertListItem(editor, tx, getOptions())) return true;

      return next();
    },
  },
});
