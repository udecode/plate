import { getCommentKey, MARK_COMMENT } from '@udecode/plate-comments';
import {
  deselectEditor,
  nanoid,
  usePlateEditorRef,
  withoutNormalizing,
} from '@udecode/plate-core';
import { useCommentsActions } from './CommentsProvider';

export const useAddCommentMark = () => {
  const editor = usePlateEditorRef();
  const setAddingCommentId = useCommentsActions().addingCommentId();
  const setActiveCommentId = useCommentsActions().activeCommentId();

  return () => {
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
      editor.addMark(getCommentKey(id), true);

      setAddingCommentId(id);
      setActiveCommentId(id);

      try {
        deselectEditor(editor);
      } catch (err) {}
    });
  };
};
