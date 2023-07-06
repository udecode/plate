'use client';

import React from 'react';
import {
  TCommentText,
  useCommentLeaf,
  useCommentLeafState,
} from '@udecode/plate-comments';
import { PlateLeaf, PlateLeafProps, Value } from '@udecode/plate-common';

export function CommentLeaf({
  className,
  ...props
}: PlateLeafProps<Value, TCommentText>) {
  const { children, nodeProps, leaf } = props;

  const state = useCommentLeafState({ leaf });
  const { props: rootProps } = useCommentLeaf(state);

  // hide resolved comments
  if (!state.commentCount) return <>{children}</>;

  let aboveChildren = <>{children}</>;

  const backgroundColor = state.isActive
    ? 'rgb(255, 212, 0)'
    : 'rgba(255, 212, 0, 0.14)';

  if (!state.isActive) {
    for (let i = 1; i < state.commentCount; i++) {
      aboveChildren = (
        <span
          style={{
            backgroundColor: 'rgba(255, 212, 0, 0.14)',
          }}
        >
          {aboveChildren}
        </span>
      );
    }
  }

  return (
    <PlateLeaf
      {...props}
      nodeProps={{
        ...rootProps,
        style: {
          backgroundColor,
          borderBottom: '2px solid rgb(255, 212, 0)',
        },
        ...nodeProps,
      }}
    >
      {aboveChildren}
    </PlateLeaf>
  );
}
