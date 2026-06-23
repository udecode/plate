import type { Element, NodeEntry } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { normalizeListSequence } from '../normalizers/normalizeListSequence';
import { ListStyleType } from '../types';
import { outdentList } from './outdentList';

/** Unset list style type if already set. */
export const toggleListUnset = (
  editor: SlateEditor,
  [node, path]: NodeEntry<Element>,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  const nodeProps = node as Record<string, unknown>;

  if (
    listStyleType === KEYS.listTodo &&
    Object.hasOwn(nodeProps, KEYS.listChecked)
  ) {
    editor.update((tx) => {
      tx.nodes.unset(KEYS.listChecked, { at: path });
    });
    outdentList(editor, { listStyleType });
    normalizeListSequence(editor, [node, path]);

    return true;
  }
  if (listStyleType === nodeProps[KEYS.listType]) {
    editor.update((tx) => {
      tx.nodes.unset([KEYS.listType], {
        at: path,
      });
    });

    outdentList(editor, { listStyleType });
    normalizeListSequence(editor, [node, path]);

    return true;
  }
};
