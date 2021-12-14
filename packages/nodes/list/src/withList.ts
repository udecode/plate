import { WithOverride } from '@udecode/plate-core';
import { deleteBackwardList } from './deleteBackwardList';
import { deleteForwardList } from './deleteForwardList';
import { deleteFragmentList } from './deleteFragmentList';
import { insertBreakList } from './insertBreakList';
import { insertFragmentList } from './insertFragmentList';
import { normalizeList } from './normalizers';
import { ListPlugin } from './types';

export const withList: WithOverride<{}, ListPlugin> = (
  editor,
  { options: { validLiChildrenTypes } }
) => {
  const { insertBreak, deleteBackward, deleteForward, deleteFragment } = editor;

  editor.insertBreak = () => {
    if (insertBreakList(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (deleteForwardList(editor)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = () => {
    if (deleteFragmentList(editor)) return;

    deleteFragment();
  };

  editor.insertFragment = insertFragmentList(editor);

  editor.normalizeNode = normalizeList(editor, { validLiChildrenTypes });

  return editor;
};
