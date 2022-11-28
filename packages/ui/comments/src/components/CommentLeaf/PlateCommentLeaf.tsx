import React, { useEffect, useState } from 'react';
import {
  commentsActions,
  getCommentKeyId,
  isCommentKey,
  TCommentText,
} from '@udecode/plate-comments';
import { Value } from '@udecode/plate-core';
import { StyledLeaf, StyledLeafProps } from '@udecode/plate-styled-components';
import { useCommentColors } from './useCommentColors';

export const PlateCommentLeaf = <V extends Value = Value>(
  props: StyledLeafProps<V, TCommentText>
) => {
  const { children, nodeProps, leaf } = props;

  const { backgroundColor } = useCommentColors(leaf);

  const [commentIds, setCommentIds] = useState<string[]>([]);

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
          console.log(lastCommentId);
          commentsActions.activeCommentId(lastCommentId);
        },
        style: { backgroundColor },
        ...nodeProps,
      }}
    >
      {children}
    </StyledLeaf>
  );
};
