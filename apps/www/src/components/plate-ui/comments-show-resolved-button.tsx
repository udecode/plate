import React from 'react';
import { useCommentsShowResolvedButton } from '@udecode/plate-comments';

import { ToolbarButton } from '@/components/ui/toolbar-button';

export function CommentsShowResolvedButton() {
  const { props } = useCommentsShowResolvedButton();

  return <ToolbarButton aria-label="Show resolved comments" {...props} />;
}
