import React from 'react';

import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useCommentsShowResolvedButtonProps } from '@/lib/@/useCommentsShowResolvedButtonProps';

export function CommentsShowResolvedButton() {
  return (
    <ToolbarButton
      aria-label="Show resolved comments"
      {...useCommentsShowResolvedButtonProps()}
    />
  );
}
