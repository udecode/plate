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

  useEffect(() => {
    const ids: string[] = [];

    Object.keys(leaf).forEach((key) => {
      if (isCommentKey(key)) {
        ids.push(getCommentKeyId(key));
      }
    });

    setCommentIds(ids);
  }, [leaf]);

  const lastCommentId = commentIds[commentIds.length - 1];

  return (
    <StyledLeaf
      {...props}
      nodeProps={{
        onMouseDown: (e: MouseEvent) => {
          e.stopPropagation();
          setActiveCommentId(lastCommentId);
        },
        style: { backgroundColor: `rgba(255,212,0, 0.56)` },
        ...nodeProps,
      }}
    >
      {children}
    </StyledLeaf>
  );
};
