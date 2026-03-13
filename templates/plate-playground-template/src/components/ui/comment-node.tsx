'use client';

import { getCommentCount } from '@platejs/comment';

import type { TCommentText } from 'platejs';
import type { PlateLeafProps } from 'platejs/react';
import { PlateLeaf, useEditorPlugin, usePluginOption } from 'platejs/react';
import { commentPlugin } from '@/components/editor/plugins/comment-kit';
import { cn } from '@/lib/utils';

export function CommentLeaf(props: PlateLeafProps<TCommentText>) {
  const { children, leaf } = props;

  const { api, setOption } = useEditorPlugin(commentPlugin);
  const hoverId = usePluginOption(commentPlugin, 'hoverId');
  const activeId = usePluginOption(commentPlugin, 'activeId');

  const isOverlapping = getCommentCount(leaf) > 1;
  const currentId = api.comment.nodeId(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  return (
    <PlateLeaf
      {...props}
      attributes={{
        ...props.attributes,
        onClick: () => setOption('activeId', currentId ?? null),
        onMouseEnter: () => setOption('hoverId', currentId ?? null),
        onMouseLeave: () => setOption('hoverId', null),
      }}
      className={cn(
        'border-b-2 border-b-highlight/[.36] bg-highlight/[.13] transition-colors duration-200',
        (isHover || isActive) && 'border-b-highlight bg-highlight/25',
        isOverlapping && 'border-b-2 border-b-highlight/[.7] bg-highlight/25',
        (isHover || isActive) &&
          isOverlapping &&
          'border-b-highlight bg-highlight/45'
      )}
    >
      {children}
    </PlateLeaf>
  );
}
