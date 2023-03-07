import { PlateEditor, Value, withoutNormalizing } from '@udecode/plate-common';
import { MARK_COMMENT } from '../constants';
import { findCommentNode } from '../queries/index';
import { getCommentKeys } from '../utils/index';

export const removeCommentMark = <V extends Value>(editor: PlateEditor<V>) => {
  const nodeEntry = findCommentNode(editor);
  if (!nodeEntry) return;

  const keys = getCommentKeys(nodeEntry[0]);

  withoutNormalizing(editor, () => {
    keys.forEach((key) => {
      editor.removeMark(key);
    });

    editor.removeMark(MARK_COMMENT);
  });
};
