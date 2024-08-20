import type { WithOverride } from '@udecode/plate-common/react';

import type { ListConfig } from '../lib/ListPlugin';

import { deleteForwardList } from '../lib/deleteForwardList';
import { deleteFragmentList } from '../lib/deleteFragmentList';
import { insertFragmentList } from '../lib/insertFragmentList';
import { normalizeList } from '../lib/normalizers';
import { deleteBackwardList } from './deleteBackwardList';
import { insertBreakList } from './insertBreakList';

export const withList: WithOverride<ListConfig> = ({
  editor,
  options: { validLiChildrenTypes },
}) => {
  const { deleteBackward, deleteForward, deleteFragment, insertBreak } = editor;

  editor.insertBreak = () => {
    // TODO react
    if (insertBreakList(editor as any)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    // TODO react
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor, deleteForward, unit)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = (direction) => {
    if (deleteFragmentList(editor)) return;

    deleteFragment(direction);
  };

  editor.insertFragment = insertFragmentList(editor);

  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
