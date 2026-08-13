'use client';

import * as React from 'react';

import type { CommentPlugin } from '@platejs/comment/react';
import type { PlateLeafProps } from 'platejs/react';

import { getCommentCount } from '@platejs/comment';
import { PlateLeaf, useEditorPlugin, usePluginStore } from 'platejs/react';

import { cn } from '@/lib/utils';
import { commentPlugin } from '@/registry/components/editor/plugins/comment-kit';

export function CommentLeaf(props: PlateLeafProps<typeof CommentPlugin>) {
  const { children, leaf } = props;

  const { api, store } = useEditorPlugin(commentPlugin);
  const hoverId = usePluginStore(commentPlugin, 'hoverId');
  const activeId = usePluginStore(commentPlugin, 'activeId');

  const isOverlapping = getCommentCount(leaf) > 1;
  const currentId = api.id(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  return (
    <PlateLeaf
      {...props}
      className={cn(
        'border-b-2 border-b-highlight/[.36] bg-highlight/[.13] transition-colors duration-200',
        (isHover || isActive) && 'border-b-highlight bg-highlight/25',
        isOverlapping && 'border-b-2 border-b-highlight/[.7] bg-highlight/25',
        (isHover || isActive) &&
          isOverlapping &&
          'border-b-highlight bg-highlight/45'
      )}
      attributes={{
        ...props.attributes,
        onClick: () => store.set({ activeId: currentId ?? null }),
        onMouseEnter: () => store.set({ hoverId: currentId ?? null }),
        onMouseLeave: () => store.set({ hoverId: null }),
      }}
    >
      {children}
    </PlateLeaf>
  );
}
