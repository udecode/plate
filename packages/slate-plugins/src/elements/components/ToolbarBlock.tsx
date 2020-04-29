import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarBlockProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isBlockActive } from '../queries';

export const ToolbarBlock = ({
  type,
  onMouseDown,
  ...props
}: ToolbarBlockProps) => {
  const editor = useSlate();

  if (!onMouseDown) {
    onMouseDown = (event: Event) => {
      event.preventDefault();
      editor.toggleBlock(type);
    };
  }

  return (
    <ToolbarButton
      {...props}
      active={isBlockActive(editor, type)}
      onMouseDown={onMouseDown}
    />
  );
};
