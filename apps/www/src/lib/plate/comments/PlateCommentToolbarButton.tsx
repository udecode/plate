import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';

import {
  ToolbarButtonOld,
  ToolbarButtonProps,
} from '@/plate/toolbar/ToolbarButtonOld';

export function PlateCommentToolbarButton(props: ToolbarButtonProps) {
  const buttonProps = useCommentAddButton(props as any);

  return <ToolbarButtonOld {...(buttonProps as any)} />;
}
