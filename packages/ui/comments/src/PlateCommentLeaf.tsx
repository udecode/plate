import React, { useEffect, useState } from 'react';
import {
  getCommentKeyId,
  isCommentKey,
  TCommentText,
} from '@udecode/plate-comments';
import { Value } from '@udecode/plate-core';
import { StyledLeaf, StyledLeafProps } from '@udecode/plate-styled-components';
import {
  useCommentsActions,
  useCommentsSelectors,
} from '../../../comments/src/stores/comments/CommentsProvider';

export const PlateCommentLeaf = <V extends Value = Value>(
  props: StyledLeafProps<V, TCommentText>
) => {
  const { children, nodeProps, leaf } = props;

  const [commentIds, setCommentIds] = useState<string[]>([]);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const comments = useCommentsSelectors().comments();
  const [commentCount, setCommentCount] = useState(1);

  useEffect(() => {
    const ids: string[] = [];
    let count = 0;

    Object.keys(leaf).forEach((key) => {
      if (!isCommentKey(key)) return;

      const id = getCommentKeyId(key);

      if (comments[id]?.isResolved) return;

      ids.push(getCommentKeyId(key));
      count++;
    });

    setCommentCount(count);
    setCommentIds(ids);
  }, [comments, leaf]);

  const lastCommentId = commentIds[commentIds.length - 1];

  let aboveChildren = <>{children}</>;

  for (let i = 1; i < commentCount; i++) {
    aboveChildren = (
      <span
        style={{
          backgroundColor: 'rgba(255,212,0, 0.28)',
        }}
      >
        {aboveChildren}
      </span>
    );
  }

  // hide resolved comments
  if (!commentCount) return <>{children}</>;

  return (
    <StyledLeaf
      {...props}
      nodeProps={{
        onMouseDown: (e: MouseEvent) => {
          e.stopPropagation();
          setActiveCommentId(lastCommentId);
        },
        style: {
          backgroundColor: `rgba(255,212,0, 0.28)`,
        },
        ...nodeProps,
      }}
    >
      {aboveChildren}
    </StyledLeaf>
  );
};
