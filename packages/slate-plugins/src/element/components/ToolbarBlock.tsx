import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { ToggleBlockEditor } from 'element/types';
import { ReactEditor, useSlate } from 'slate-react';
import { ToolbarBlockProps, ToolbarButton } from 'components/Toolbar';

export const ToolbarBlock = ({
  type,
  onMouseDown,
  ...props
}: ToolbarBlockProps) => {
  const editor = useSlate() as ReactEditor & ToggleBlockEditor;

  if (!onMouseDown) {
    onMouseDown = (event: Event) => {
      event.preventDefault();
      editor.toggleBlock(type);
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
