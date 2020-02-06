import React from 'react';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarButtonProps } from '../../../common/components';
import { isSelectionInTable } from '../queries';

export interface ToolbarTableProps extends ToolbarButtonProps {
  action: (editor: Editor) => void;
}

export const ToolbarTable = (props: ToolbarTableProps) => {
  const editor = useSlate();
  const isTableActive = isSelectionInTable(editor);

  return (
    <ToolbarButton
      {...props}
      active={isTableActive}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        props.action(editor);
      }}
    />
  );
};
