import React from 'react';
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

export const TableToolbarButtons = () => (
  <>
    <TableToolbarButton
      tooltip={{ content: 'Table' }}
      icon={<BorderAll />}
      transform={insertTable}
    />
    <TableToolbarButton
      tooltip={{ content: 'Remove Table' }}
      icon={<BorderClear />}
      transform={deleteTable}
    />
    <TableToolbarButton
      tooltip={{ content: 'Table Row' }}
      icon={<BorderBottom />}
      transform={insertTableRow}
    />
    <TableToolbarButton
      tooltip={{ content: 'Remove Table Row' }}
      icon={<BorderTop />}
      transform={deleteRow}
    />
    <TableToolbarButton
      tooltip={{ content: 'Table Column' }}
      icon={<BorderLeft />}
      transform={insertTableColumn}
    />
    <TableToolbarButton
      tooltip={{ content: 'Remove Table Column' }}
      icon={<BorderRight />}
      transform={deleteColumn}
    />
  </>
);
