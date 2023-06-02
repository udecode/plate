'use client';

import React from 'react';
import { TCommentText } from '@udecode/plate-comments';
import { Value } from '@udecode/plate-common';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

import { useCommentLeafState } from '@/lib/@/useCommentLeafState';

export function CommentLeaf({
  className,
  ...props
}: PlateLeafProps<Value, TCommentText>) {
  const { children, nodeProps, leaf } = props;

  const { commentCount, isActive, onClick } = useCommentLeafState({ leaf });

  // hide resolved comments
  if (!commentCount) return <>{children}</>;

  let aboveChildren = <>{children}</>;

  const backgroundColor = isActive
    ? 'rgb(255, 212, 0)'
    : 'rgba(255, 212, 0, 0.14)';

  if (!isActive) {
    for (let i = 1; i < commentCount; i++) {
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
        onClick,
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
