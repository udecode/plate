import type { WithOverride } from '@udecode/plate-common';

import type { ListConfig } from '.';

import { deleteBackwardList } from './deleteBackwardList';
import { deleteForwardList } from './deleteForwardList';
import { deleteFragmentList } from './deleteFragmentList';
import { insertBreakList } from './insertBreakList';
import { insertFragmentList } from './insertFragmentList';
import { normalizeList } from './normalizers/index';

export const withList: WithOverride<ListConfig> = ({
  editor,
  options: { validLiChildrenTypes },
}) => {
  const { deleteBackward, deleteForward, deleteFragment, insertBreak } = editor;

  editor.insertBreak = () => {
    if (insertBreakList(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
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
