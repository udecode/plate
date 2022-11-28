import {
  deselectEditor,
  nanoid,
  PlateEditor,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { MARK_COMMENT } from '../constants';
import { commentsActions } from './commentsStore';
import { getCommentKey } from './utils';

export const addCommentMark = <V extends Value>(editor: PlateEditor<V>) => {
  const { selection } = editor;
  if (!selection) return;

  const id = nanoid();

  withoutNormalizing(editor, () => {
    // add comment prop to inline elements
    // const entries = getNodes(editor, {
    //   // TODO
    // });
    //
    // Array.from(entries).forEach(([, path]) => {
    //   setNodes(
    //     editor,
    //     {
    //       [key]: comment,
    //     },
    //     { at: path }
    //   );
    // });

    editor.addMark(MARK_COMMENT, true);

    // add comment mark to leaves
    editor.addMark(getCommentKey(id), true);

    commentsActions.addingCommentId(id);
    commentsActions.activeCommentId(id);

    try {
      deselectEditor(editor);
    } catch (err) {}
  });
};
