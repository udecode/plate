import { ReactEditor } from 'slate-react';
import { getListNormalizer } from './normalizers/getListNormalizer';
import { deleteBackwardList } from './transforms/deleteBackwardList';
import { deleteFragmentList } from './transforms/deleteFragmentList';
import { insertBreakList } from './transforms/insertBreakList';
import { WithListOptions } from './types';

export const withList = ({
  validLiChildrenTypes,
  ...options
}: WithListOptions = {}) => <T extends ReactEditor>(editor: T) => {
  const { insertBreak, deleteBackward, deleteFragment } = editor;

  editor.insertBreak = () => {
    if (insertBreakList(editor, options)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (deleteBackwardList(editor, unit, options)) return;

    deleteBackward(unit);
  };

  editor.deleteFragment = () => {
    if (deleteFragmentList(editor, options)) return;

    deleteFragment();
  };

  editor.normalizeNode = getListNormalizer(
    editor,
    { validLiChildrenTypes },
    options
  );

  return editor;
};
