import React, { useEffect, useState } from 'react';
import {
  getCommentKeyId,
  isCommentKey,
  TCommentText,
} from '@udecode/plate-comments';
import { Value } from '@udecode/plate-core';
import { StyledLeaf, StyledLeafProps } from '@udecode/plate-styled-components';
import { useCommentsActions } from '../CommentsProvider';

export const PlateCommentLeaf = <V extends Value = Value>(
  props: StyledLeafProps<V, TCommentText>
) => {
  const { children, nodeProps, leaf } = props;

  const [commentIds, setCommentIds] = useState<string[]>([]);
  const setActiveCommentId = useCommentsActions().activeCommentId();
  const [commentCount, setCommentCount] = useState(1);

  useEffect(() => {
    const ids: string[] = [];
    let count = 0;

    Object.keys(leaf).forEach((key) => {
      if (isCommentKey(key)) {
        ids.push(getCommentKeyId(key));
        count++;
      }
    });

    setCommentCount(count);
    setCommentIds(ids);
  }, [leaf]);

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
