'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  type TCommentText,
  getCommentLastId,
  hasManyComments,
} from '@udecode/plate-comments';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import {
  type PlateLeafProps,
  PlateLeaf,
  usePluginOption,
} from '@udecode/plate/react';

export function CommentLeaf({
  className,
  ...props
}: PlateLeafProps<TCommentText>) {
  const { children, editor, leaf, nodeProps } = props;

  const { setOption } = editor;
  const hoverId = usePluginOption(CommentsPlugin, 'hoverId');
  const activeId = usePluginOption(CommentsPlugin, 'activeId');

  const isOverlapping = hasManyComments(leaf);
  const lastId = getCommentLastId(leaf);
  const isActive = activeId === lastId;
  const isHover = hoverId === lastId;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        'border-b-2 border-b-highlight/[.36] bg-highlight/[.13] transition-colors duration-200',
        (isHover || isActive) && 'border-b-highlight bg-highlight/25',
        isOverlapping && 'border-b-2 border-b-highlight/[.7] bg-highlight/25',
        (isHover || isActive) &&
          isOverlapping &&
          'border-b-highlight bg-highlight/45',
        className
      )}
      onClick={() => setOption(CommentsPlugin, 'activeId', lastId ?? null)}
      onMouseEnter={() => setOption(CommentsPlugin, 'hoverId', lastId ?? null)}
      onMouseLeave={() => setOption(CommentsPlugin, 'hoverId', null)}
      nodeProps={{
        ...nodeProps,
      }}
    >
      {children}
    </PlateLeaf>
  );
}
