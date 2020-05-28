import React from 'react';
import { isNodeInSelection } from 'common/queries';
import { getPreventDefaultHandler } from 'common/utils/getPreventDefaultHandler';
import { ToolbarTableProps } from 'elements/table/components/ToolbarTable.types';
import { TableType } from 'elements/table/types';
import { useSlate } from 'slate-react';
import { ToolbarButton } from 'components/ToolbarButton';

export const ToolbarTable = ({
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
  transform,
  ...props
}: ToolbarTableProps) => {
  const editor = useSlate();

  return (
    <ToolbarButton
      active={isNodeInSelection(editor, typeTable)}
      onMouseDown={getPreventDefaultHandler(transform, editor, {
        typeTable,
        typeTr,
        typeTd,
      })}
      {...props}
    />
  );
};
