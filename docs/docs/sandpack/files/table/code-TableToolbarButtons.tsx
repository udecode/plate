export const tableToolbarButtonsCode = `import React from 'react';
import { BorderAll } from '@styled-icons/material/BorderAll';
import { BorderBottom } from '@styled-icons/material/BorderBottom';
import { BorderClear } from '@styled-icons/material/BorderClear';
import { BorderLeft } from '@styled-icons/material/BorderLeft';
import { BorderRight } from '@styled-icons/material/BorderRight';
import { BorderTop } from '@styled-icons/material/BorderTop';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
  TableToolbarButton,
} from '@udecode/plate';

const tooltip = (content: string) => ({
  content,
});

export const TableToolbarButtons = () => (
  <>
    <TableToolbarButton
      tooltip={tooltip('Table')}
      icon={<BorderAll />}
      transform={insertTable}
    />
    <TableToolbarButton
      tooltip={tooltip('Remove Table')}
      icon={<BorderClear />}
      transform={deleteTable}
    />
    <TableToolbarButton
      tooltip={tooltip('Table Row')}
      icon={<BorderBottom />}
      transform={insertTableRow}
    />
    <TableToolbarButton
      tooltip={tooltip('Remove Table Row')}
      icon={<BorderTop />}
      transform={deleteRow}
    />
    <TableToolbarButton
      tooltip={tooltip('Table Column')}
      icon={<BorderLeft />}
      transform={insertTableColumn}
    />
    <TableToolbarButton
      tooltip={tooltip('Remove Table Column')}
      icon={<BorderRight />}
      transform={deleteColumn}
    />
  </>
);
`;

export const tableToolbarButtonsFile = {
  '/table/TableToolbarButtons.tsx': tableToolbarButtonsCode,
};
