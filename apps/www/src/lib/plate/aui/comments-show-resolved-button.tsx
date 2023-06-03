import React from 'react';

import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useCommentsShowResolvedButton } from '@/lib/@/useCommentsShowResolvedButton';

export function CommentsShowResolvedButton() {
  const { props } = useCommentsShowResolvedButton();

  return <ToolbarButton aria-label="Show resolved comments" {...props} />;
}
