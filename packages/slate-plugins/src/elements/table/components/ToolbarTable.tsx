import React from 'react';
import { ToolbarButton, ToolbarButtonProps } from 'common/components';
import { TableType, TableTypeOptions } from 'elements/table/types';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import { isSelectionInTable } from '../queries';

export interface ToolbarTableProps
  extends ToolbarButtonProps,
    TableTypeOptions {
  action: (editor: Editor, options: TableTypeOptions) => void;
}

export const ToolbarTable = ({
  action,
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
  ...props
}: ToolbarTableProps) => {
  const editor = useSlate();
  const isTableActive = isSelectionInTable(editor, { typeTable });

  return (
    <ToolbarButton
      {...props}
      active={isTableActive}
      onMouseDown={(event: Event) => {
        event.preventDefault();
        action(editor, { typeTable, typeTr, typeTd });
      }}
    />
  );
};
