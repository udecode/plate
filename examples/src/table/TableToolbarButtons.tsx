import React from 'react';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
  TableToolbarButton,
} from '@udecode/plate';
import { Icons } from '../common/icons';

const tooltip = (content: string) => ({
  content,
});

export function TableToolbarButtons() {
  return (
    <>
      <TableToolbarButton
        tooltip={tooltip('Table')}
        icon={<Icons.borderAll />}
        transform={insertTable}
      />
      <TableToolbarButton
        tooltip={tooltip('Remove Table')}
        icon={<Icons.borderNone />}
        transform={deleteTable}
      />
      <TableToolbarButton
        tooltip={tooltip('Table Row')}
        icon={<Icons.borderBottom />}
        transform={insertTableRow}
      />
      <TableToolbarButton
        tooltip={tooltip('Remove Table Row')}
        icon={<Icons.borderTop />}
        transform={deleteRow}
      />
      <TableToolbarButton
        tooltip={tooltip('Table Column')}
        icon={<Icons.borderLeft />}
        transform={insertTableColumn}
      />
      <TableToolbarButton
        tooltip={tooltip('Remove Table Column')}
        icon={<Icons.borderRight />}
        transform={deleteColumn}
      />
    </>
  );
}
