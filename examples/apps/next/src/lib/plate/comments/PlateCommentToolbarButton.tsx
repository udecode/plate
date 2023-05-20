import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';
import { ToolbarButton, ToolbarButtonProps } from '../toolbar/ToolbarButton';

export function PlateCommentToolbarButton(props: ToolbarButtonProps) {
  const buttonProps = useCommentAddButton(props as any);

  return <ToolbarButton {...(buttonProps as any)} />;
}
