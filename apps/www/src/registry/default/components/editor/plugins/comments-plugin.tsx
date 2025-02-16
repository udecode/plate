'use client';

import { CommentsPlugin } from '@udecode/plate-comments/react';

import { BlockComments } from '@/registry/default/plate-ui/block-comments';

export const commentsPlugin = CommentsPlugin.configure({
  render: {
    aboveNodes: BlockComments as any,
  },
});
