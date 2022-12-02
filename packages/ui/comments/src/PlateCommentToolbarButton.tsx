import React from 'react';
import { useCommentAddButton } from '@udecode/plate-comments';
import { ToolbarButton, ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export const PlateCommentToolbarButton = (props: ToolbarButtonProps) => {
  const buttonProps = useCommentAddButton(props as any);

  return <ToolbarButton {...(buttonProps as any)} />;
};
