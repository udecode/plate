import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { ToggleTypeEditor } from 'element/types';
import { ReactEditor, useSlate } from 'slate-react';
import { ToolbarBlockProps, ToolbarButton } from 'components/Toolbar';

export const ToolbarBlock = ({
  type,
  onMouseDown,
  ...props
}: ToolbarBlockProps) => {
  const editor = useSlate() as ReactEditor & ToggleTypeEditor;

  if (!onMouseDown) {
    onMouseDown = (event: Event) => {
      event.preventDefault();
      editor.toggleType(type);
    };
  }

  return (
    <ToolbarButton
      {...props}
      active={isNodeInSelection(editor, type)}
      onMouseDown={onMouseDown}
    />
  );
};
