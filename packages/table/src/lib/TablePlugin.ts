import {
  type DeserializeHtml,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { TableConfig } from './types';

import { insertTableColumn, insertTableRow } from './transforms/index';
import { getEmptyCellNode } from './utils';
import { withTable } from './withTable';

export const TableRowPlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [{ validNodeName: 'TR' }],
  },
  isElement: true,
  key: 'tr',
});

export const TableCellPlugin = createSlatePlugin({
  isElement: true,
  key: 'td',
}).extend(({ editor }) => ({
  deserializeHtml: {
    attributeNames: ['rowspan', 'colspan'],
    getNode: createGetNodeFunc(editor.getType({ key: 'td' })),
    rules: [{ validNodeName: 'TD' }],
  },
}));

export const TableCellHeaderPlugin = createSlatePlugin({
  isElement: true,
  key: 'th',
}).extend(({ editor }) => ({
  deserializeHtml: {
    attributeNames: ['rowspan', 'colspan'],
    getNode: createGetNodeFunc(editor.getType({ key: 'th' })),
    rules: [{ validNodeName: 'TH' }],
  },
}));

/** Enables support for tables. */
export const TablePlugin = createTSlatePlugin<TableConfig>({
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
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
})
  .extendApi(({ editor }) => ({
    table: {
      cellFactory: bindFirst(getEmptyCellNode, editor),
      getCellChildren: (cell) => cell.children,
    },
  }))
  .extendApi(({ editor }) => ({
    table: {
      cellFactory: bindFirst(getEmptyCellNode, editor),
      getCellChildren: (cell) => cell.children,
    },
  }))
  .extendTransforms(({ editor }) => ({
    table: {
      insertColumn: bindFirst(insertTableColumn, editor),
      insertRow: bindFirst(insertTableRow, editor),
    },
  }));

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
