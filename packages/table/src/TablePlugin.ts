import {
  type DeserializeHtml,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common';

import type { TablePluginOptions, TableStoreCellAttributes } from './types';

import { onKeyDownTable } from './onKeyDownTable';
import { insertTableColumn, insertTableRow } from './transforms/index';
import { getEmptyCellNode } from './utils';
import { withTable } from './withTable';

const createGetNodeFunc = (type: string) => {
  const getNode: DeserializeHtml['getNode'] = ({ element }) => {
    const background =
      element.style.background || element.style.backgroundColor;

    if (background) {
      return {
        background,
        type,
      };
    }

    return { type };
  };

  return getNode;
};

export const TableRowPlugin = createPlugin({
  deserializeHtml: {
    rules: [{ validNodeName: 'TR' }],
  },
  isElement: true,
  key: 'tr',
});

export const TableCellPlugin = createPlugin({
  isElement: true,
  key: 'td',
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
}).extend(({ editor }) => ({
  deserializeHtml: {
    attributeNames: ['rowspan', 'colspan'],
    getNode: createGetNodeFunc(getPluginType(editor, 'td')),
    rules: [{ validNodeName: 'TD' }],
  },
}));

export const TableCellHeaderPlugin = createPlugin({
  isElement: true,
  key: 'th',
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
}).extend(({ editor }) => ({
  deserializeHtml: {
    attributeNames: ['rowspan', 'colspan'],
    getNode: createGetNodeFunc(getPluginType(editor, 'th')),
    rules: [{ validNodeName: 'TH' }],
  },
}));

/** Enables support for tables. */
export const TablePlugin = createPlugin({
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
  },
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  isElement: true,
  key: 'table',
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  withOverrides: withTable,
}).extend<TablePluginOptions>(({ editor }) => ({
  options: {
    _cellIndices: new WeakMap() as TableStoreCellAttributes,
    cellFactory: (options: any) => getEmptyCellNode(editor, options),
    enableMerging: false,
    getCellChildren: (cell: any) => cell.children,
    insertColumn: (e, { fromCell }) => {
      insertTableColumn(e, {
        disableSelect: true,
        fromCell,
      });
    },
    insertRow: (e, { fromRow }) => {
      insertTableRow(e, {
        disableSelect: true,
        fromRow,
      });
    },
    minColumnWidth: 48,
  },
}));
