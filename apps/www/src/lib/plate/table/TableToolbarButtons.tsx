import React from 'react';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
} from '@udecode/plate';
import { TableToolbarButton } from './TableToolbarButton';

import { Icons } from '@/components/icons';

export function TableToolbarButtons() {
  return (
    <>
      <TableToolbarButton tooltip="Table" transform={insertTable}>
        <Icons.borderAll />
      </TableToolbarButton>
      <TableToolbarButton tooltip="Remove Table" transform={deleteTable}>
        <Icons.borderNone />
      </TableToolbarButton>
      <TableToolbarButton tooltip="Table Row" transform={insertTableRow}>
        <Icons.borderBottom />
      </TableToolbarButton>
      <TableToolbarButton tooltip="Remove Table Row" transform={deleteRow}>
        <Icons.borderTop />
      </TableToolbarButton>
      <TableToolbarButton tooltip="Table Column" transform={insertTableColumn}>
        <Icons.borderLeft />
      </TableToolbarButton>
      <TableToolbarButton
        tooltip="Remove Table Column"
        transform={deleteColumn}
      >
        <Icons.borderRight />
      </TableToolbarButton>
    </>
  );
}
