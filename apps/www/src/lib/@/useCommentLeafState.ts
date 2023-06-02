import { useCallback, useEffect, useState } from 'react';
import {
  getCommentKeyId,
  isCommentKey,
  TCommentText,
  useCommentsActions,
  useCommentsSelectors,
} from '@udecode/plate-comments';

export const useCommentLeafState = ({ leaf }: { leaf: TCommentText }) => {
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
    }

    setCommentCount(count);
    setCommentIds(ids);
  }, [activeCommentId, comments, isActive, leaf]);

  const lastCommentId = commentIds[commentIds.length - 1];

  return {
    commentCount,
    isActive,
    onClick: useCallback(
      (e: MouseEvent) => {
        e.stopPropagation();
        setActiveCommentId(lastCommentId);
      },
      [lastCommentId, setActiveCommentId]
    ),
  };
};
