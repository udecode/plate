export const tableToolbarButtonsCode = `import React from 'react';
import { BorderAll } from '@styled-icons/material/BorderAll';
import { BorderBottom } from '@styled-icons/material/BorderBottom';
import { BorderClear } from '@styled-icons/material/BorderClear';
import { BorderLeft } from '@styled-icons/material/BorderLeft';
import { BorderRight } from '@styled-icons/material/BorderRight';
import { BorderTop } from '@styled-icons/material/BorderTop';
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  TableToolbarButton,
} from '@udecode/plate';

export const TableToolbarButtons = () => (
  <>
    <TableToolbarButton icon={<BorderAll />} transform={insertTable} />
    <TableToolbarButton icon={<BorderClear />} transform={deleteTable} />
    <TableToolbarButton icon={<BorderBottom />} transform={addRow} />
    <TableToolbarButton icon={<BorderTop />} transform={deleteRow} />
    <TableToolbarButton icon={<BorderLeft />} transform={addColumn} />
    <TableToolbarButton icon={<BorderRight />} transform={deleteColumn} />
  </>
);
`;

export const tableToolbarButtonsFile = {
  '/table/TableToolbarButtons.tsx': tableToolbarButtonsCode,
};
