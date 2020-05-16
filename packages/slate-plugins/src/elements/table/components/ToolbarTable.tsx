import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { TableType, TableTypeOptions } from 'elements/table/types';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarButtonProps } from 'components/Toolbar';

export interface ToolbarTableProps
  extends ToolbarButtonProps,
    TableTypeOptions {
  action: (editor: Editor, options?: Required<TableTypeOptions>) => void;
}

export const ToolbarTable = ({
  action,
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
  ...props
}: ToolbarTableProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      {...props}
      active={isNodeInSelection(editor, typeTable)}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        action(editor, { typeTable, typeTr, typeTd });
      }}
    />
  );
};
