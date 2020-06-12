import * as React from 'react';
import { useSlate } from 'slate-react';
import { isNodeInSelection } from '../../../common/queries';
import { getPreventDefaultHandler } from '../../../common/utils';
import { ToolbarButton } from '../../../components/ToolbarButton';
import { TableType } from '../types';
import { ToolbarTableProps } from './ToolbarTable.types';

export const ToolbarTable = ({
  typeTable = TableType.TABLE,
  typeTr = TableType.ROW,
  typeTd = TableType.CELL,
  typeTh = TableType.HEAD,
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
        typeTh,
      })}
      {...props}
    />
  );
};
