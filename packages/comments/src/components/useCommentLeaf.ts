import React from 'react';

import { useEditorRef } from '@udecode/plate-common';

import {
  type TCommentText,
  getCommentKeyId,
  isCommentKey,
  unsetCommentNodesById,
  useCommentsActions,
  useCommentsSelectors,
} from '..';

export const useCommentLeafState = ({ leaf }: { leaf: TCommentText }) => {
  const editor = useEditorRef();
  const [commentIds, setCommentIds] = React.useState<string[]>([]);
  const activeCommentId = useCommentsSelectors().activeCommentId();
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const comments = useCommentsSelectors().comments();
  const [commentCount, setCommentCount] = React.useState(1);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
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
  lastCommentId,
  setActiveCommentId,
}: ReturnType<typeof useCommentLeafState>) => {
  return {
    props: {
      onClick: React.useCallback(
        (e: MouseEvent) => {
          e.stopPropagation();
          setActiveCommentId(lastCommentId);
        },
        [lastCommentId, setActiveCommentId]
      ),
    },
  };
};
