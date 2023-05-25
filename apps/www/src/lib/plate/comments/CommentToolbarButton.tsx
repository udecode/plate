import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';

import {
  ToolbarButton,
  ToolbarButtonProps,
} from '@/components/ui/toolbar-button';

export function CommentToolbarButton(props: ToolbarButtonProps) {
  const buttonProps = useCommentAddButton(props as any);

  return <ToolbarButton tooltip="Comment (⌘+⇧+M)" {...(buttonProps as any)} />;
}
