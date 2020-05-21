import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { TableType, TableTypeOption } from 'elements/table/types';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import { ToolbarButton, ToolbarButtonProps } from 'components/Toolbar';

export interface ToolbarTableProps extends ToolbarButtonProps, TableTypeOption {
  action: (editor: Editor, options?: Required<TableTypeOption>) => void;
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
      onMouseDown={getPreventDefaultHandler(action, editor, {
        typeTable,
        typeTr,
        typeTd,
      })}
    />
  );
};
