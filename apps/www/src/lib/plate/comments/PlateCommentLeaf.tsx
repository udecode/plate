'use client';

import React, { useEffect, useState } from 'react';
import {
  getCommentKeyId,
  isCommentKey,
  TCommentText,
  useCommentsActions,
  useCommentsSelectors,
} from '@udecode/plate-comments';
import { Value } from '@udecode/plate-common';
import { PlateLeaf, PlateLeafProps } from '@udecode/plate-tailwind';

export function PlateCommentLeaf({
  className,
  ...props
}: PlateLeafProps<Value, TCommentText>) {
  const { children, nodeProps, leaf } = props;

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

  // hide resolved comments
  if (!commentCount) return <>{children}</>;

  return (
    <PlateLeaf
      {...props}
      nodeProps={{
        onMouseDown: (e: MouseEvent) => {
          e.stopPropagation();
          setActiveCommentId(lastCommentId);
        },
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
