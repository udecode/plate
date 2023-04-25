import {
  deselectEditor,
  isExpanded,
  isText,
  nanoid,
  setNodes,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { MARK_COMMENT } from '../../constants';
import { getCommentKey } from '../../utils/index';
import { useCommentsActions } from './CommentsProvider';

export const useAddCommentMark = () => {
  const editor = usePlateEditorRef();
  const setActiveCommentId = useCommentsActions().activeCommentId();

  return () => {
    const { selection } = editor;
    if (!isExpanded(selection)) return;

    const id = nanoid();

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

    setNodes(
      editor,
      { [MARK_COMMENT]: true, [getCommentKey(id)]: true },
      { match: isText, split: true }
    );

    try {
      deselectEditor(editor);
    } catch (err) {}

    setTimeout(() => {
      setActiveCommentId(id);
    }, 0);
  };
};
