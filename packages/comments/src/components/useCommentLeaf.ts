import { useCallback, useEffect, useState } from 'react';
import { useEditorRef } from '@udecode/plate-common';

import {
  getCommentKeyId,
  isCommentKey,
  TCommentText,
  unsetCommentNodesById,
  useCommentsActions,
  useCommentsSelectors,
} from '..';

export const useCommentLeafState = ({ leaf }: { leaf: TCommentText }) => {
  const editor = useEditorRef();
  const [commentIds, setCommentIds] = useState<string[]>([]);
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const comments = useCommentsSelectors().comments();
  const [commentCount, setCommentCount] = useState(1);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const ids: string[] = [];
    let count = 0;

    let _isActive = false;

    Object.keys(leaf).forEach((key) => {
      if (!isCommentKey(key)) return;

      const id = getCommentKeyId(key);

      if (comments[id]?.isResolved) return;

      if (id === activeCommentId) {
        _isActive = true;
        setIsActive(true);
      }

      ids.push(getCommentKeyId(key));
      count++;
    });

    if (!_isActive && isActive) {
      setIsActive(false);

      // Remove comment nodes for unsubmitted comments
      ids.forEach((id) => {
        if (!comments[id]) {
          unsetCommentNodesById(editor, { id });
        }
      });
    }

    setCommentCount(count);
    setCommentIds(ids);
  }, [editor, activeCommentId, comments, isActive, leaf]);

  const lastCommentId = commentIds.at(-1)!;

  return {
    commentCount,
    isActive,
    lastCommentId,
    setActiveCommentId,
  };
};

export const useCommentLeaf = ({
  setActiveCommentId,
  lastCommentId,
}: ReturnType<typeof useCommentLeafState>) => {
  return {
    props: {
      onClick: useCallback(
        (e: MouseEvent) => {
          e.stopPropagation();
          setActiveCommentId(lastCommentId);
        },
        [lastCommentId, setActiveCommentId]
      ),
    },
  };
};
