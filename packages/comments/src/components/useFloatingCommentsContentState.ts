import { useRef } from 'react';
import { useOnClickOutside, usePlateEditorRef } from '@udecode/plate-common';
import {
  useCommentById,
  useCommentsActions,
  useCommentsSelectors,
} from '../stores/index';
import { unsetCommentNodesById } from '../utils/index';

export const useFloatingCommentsContentState = () => {
  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const activeComment = useCommentById(activeCommentId);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const editor = usePlateEditorRef();
  const myUserId = useCommentsSelectors().myUserId();

  const ref = useRef(null);

  const refs: any[] = [ref];

  useOnClickOutside(
    () => {
      if (!activeComment) {
        unsetCommentNodesById(editor, { id: activeCommentId });
      }

      setActiveCommentId(null);
    },
    { refs }
  );

  return {
    ref,
    activeCommentId,
    myUserId,
    hasNoComment: !activeComment,
  };
};
