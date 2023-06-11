'use client';

import React from 'react';
import { useCommentsShowResolvedButton } from '@udecode/plate-comments';

import { ToolbarButton } from '@/components/ui/toolbar';

export function CommentsShowResolvedButton() {
  const { props } = useCommentsShowResolvedButton();

  return <ToolbarButton aria-label="Show resolved comments" {...props} />;
}
