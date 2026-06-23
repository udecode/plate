import type { NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { normalizeListSequence } from '../normalizers/normalizeListSequence';
import { ListStyleType } from '../types';
import { setIndentTodoNodeTx, setListNodeTx } from './setListNode';

/**
 * Set indent list to the given entries. Add indent if listStyleType was not
 * defined.
 */
export const setListNodes = (
  editor: BasePlateEditor,
  entries: NodeEntry[],
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  const startPath = entries[0]?.[1];

  editor.update((tx) => {
    entries.forEach((entry) => {
      const [node, path] = entry;
      const nodeProps = node as Record<string, unknown>;

      let indent = (nodeProps[KEYS.indent] as number) ?? 0;
      indent =
        nodeProps[KEYS.listType] || Object.hasOwn(nodeProps, KEYS.listChecked)
          ? indent
          : indent + 1;

      if (listStyleType === 'todo') {
        tx.nodes.unset(KEYS.listType, { at: path });
        setIndentTodoNodeTx(tx, {
          at: path,
          indent,
          listStyleType,
        });

        return;
      }

      tx.nodes.unset(KEYS.listChecked, { at: path });
      setListNodeTx(tx, {
        at: path,
        indent,
        listStyleType,
      });
    });
  });

  if (startPath) {
    normalizeListSequence(editor, startPath);
  }
};
