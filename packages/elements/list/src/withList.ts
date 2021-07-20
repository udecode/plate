import { SPEditor, WithOverride } from '@udecode/slate-plugins-core';
import { getListDeleteBackward } from './getListDeleteBackward';
import { getListDeleteFragment } from './getListDeleteFragment';
import { getListInsertBreak } from './getListInsertBreak';
import { getListNormalizer } from './normalizers';
import { WithListOptions } from './types';

export const withList = ({
  validLiChildrenTypes,
}: WithListOptions = {}): WithOverride<SPEditor> => (editor) => {
  const { insertBreak, deleteBackward, deleteFragment } = editor;

  editor.insertBreak = () => {
    if (getListInsertBreak(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (getListDeleteBackward(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteFragment = () => {
    if (getListDeleteFragment(editor)) return;

    deleteFragment();
  };

  editor.normalizeNode = getListNormalizer(editor, { validLiChildrenTypes });

  return editor;
};
