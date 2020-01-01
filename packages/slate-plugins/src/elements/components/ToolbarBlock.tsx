import React from 'react';
import { ToolbarButton } from 'common';
import { ToolbarFormatProps } from 'common/types';
import { useSlate } from 'slate-react';
import { isBlockActive } from '../queries';

export const ToolbarBlock = ({
  format,
  onClick,
  ...props
}: ToolbarFormatProps) => {
  const editor = useSlate();

  if (!onClick) {
    onClick = (event: Event) => {
      event.preventDefault();
      editor.toggleBlock(format);
    };
  }

  return (
    <ToolbarButton
      {...props}
      active={isBlockActive(editor, format)}
      onMouseDown={onClick}
    />
  );
};
