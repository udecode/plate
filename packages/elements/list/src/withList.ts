import { WithOverride } from '@udecode/plate-core';
import { getListDeleteBackward } from './getListDeleteBackward';
import { getListDeleteForward } from './getListDeleteForward';
import { getListDeleteFragment } from './getListDeleteFragment';
import { getListInsertBreak } from './getListInsertBreak';
import { getListInsertFragment } from './getListInsertFragment';
import { getListNormalizer } from './normalizers';
import { ListPlugin } from './types';

export const withList = (): WithOverride<{}, ListPlugin> => (
  editor,
  { validLiChildrenTypes }
) => {
  const { insertBreak, deleteBackward, deleteForward, deleteFragment } = editor;

  editor.insertBreak = () => {
    if (getListInsertBreak(editor)) return;

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    if (getListDeleteBackward(editor, unit)) return;

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    if (getListDeleteForward(editor)) return;

    deleteForward(unit);
  };

  editor.deleteFragment = () => {
    if (getListDeleteFragment(editor)) return;

    deleteFragment();
  };

  editor.insertFragment = getListInsertFragment(editor);

  editor.normalizeNode = getListNormalizer(editor, { validLiChildrenTypes });

  return editor;
};
