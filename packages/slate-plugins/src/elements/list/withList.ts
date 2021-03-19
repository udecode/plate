import { WithOverride } from '@udecode/slate-plugins-core';
import { getListNormalizer } from './normalizers/getListNormalizer';
import { deleteBackwardList } from './transforms/deleteBackwardList';
import { deleteFragmentList } from './transforms/deleteFragmentList';
import { insertBreakList } from './transforms/insertBreakList';
import { WithListOptions } from './types';

export const withList = ({
  validLiChildrenTypes,
}: WithListOptions = {}): WithOverride => (editor) => {
  const { insertBreak, deleteBackward, deleteFragment } = editor;

  editor.insertBreak = () => {
    if (insertBreakList(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (deleteBackwardList(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteFragment = () => {
    if (deleteFragmentList(editor)) return;

    deleteFragment();
  };

  editor.normalizeNode = getListNormalizer(editor, { validLiChildrenTypes });

  return editor;
};
