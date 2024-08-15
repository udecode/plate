import { type DeserializeHtml, createPlugin } from '@udecode/plate-common';

import type { TableConfig } from './types';

import { onKeyDownTable } from './onKeyDownTable';
import { insertTableColumn, insertTableRow } from './transforms/index';
import { getEmptyCellNode } from './utils';
import { withTable } from './withTable';

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
    getNode: createGetNodeFunc(editor.getType({ key: 'td' })),
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
    getNode: createGetNodeFunc(editor.getType({ key: 'th' })),
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
  options: {
    _cellIndices: new WeakMap(),
    enableMerging: false,
    minColumnWidth: 48,
  },
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  withOverrides: withTable,
}).extendApi<TableConfig['api']>(({ editor }) => ({
  table: {
    cellFactory: (options) => getEmptyCellNode(editor, options),
    getCellChildren: (cell) => cell.children,
    insertColumn: (options) => insertTableColumn(editor, options),
    insertRow: (options) => insertTableRow(editor, options),
  },
})) satisfies TableConfig;

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
