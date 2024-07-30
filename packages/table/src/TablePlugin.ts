import {
  type DeserializeHtml,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TablePluginOptions, TableStoreCellAttributes } from './types';

import { onKeyDownTable } from './onKeyDownTable';
import { insertTableColumn, insertTableRow } from './transforms/index';
import { getEmptyCellNode } from './utils';
import { withTable } from './withTable';

export const ELEMENT_TABLE = 'table';

export const ELEMENT_TH = 'th';

export const ELEMENT_TR = 'tr';

export const ELEMENT_TD = 'td';

const createGetNodeFunc = (type: string) => {
  const getNode: DeserializeHtml['getNode'] = (element) => {
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
  key: ELEMENT_TR,
});

export const TableCellPlugin = createPlugin({
  isElement: true,
  key: ELEMENT_TD,
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
}).extend((editor) => ({
  deserializeHtml: {
    attributeNames: ['rowspan', 'colspan'],
    getNode: createGetNodeFunc(getPluginType(editor, ELEMENT_TD)),
    rules: [{ validNodeName: 'TD' }],
  },
}));

export const TableCellHeaderPlugin = createPlugin({
  isElement: true,
  key: ELEMENT_TH,
  props: ({ element }) => ({
    nodeProps: {
      colSpan: (element?.attributes as any)?.colspan,
      rowSpan: (element?.attributes as any)?.rowspan,
    },
  }),
}).extend((editor) => ({
  deserializeHtml: {
    attributeNames: ['rowspan', 'colspan'],
    getNode: createGetNodeFunc(getPluginType(editor, ELEMENT_TH)),
    rules: [{ validNodeName: 'TH' }],
  },
}));

/** Enables support for tables. */
export const TablePlugin = createPlugin<TablePluginOptions>({
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
  },
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  isElement: true,
  key: ELEMENT_TABLE,
  options: {
    _cellIndices: new WeakMap() as TableStoreCellAttributes,
    enableMerging: false,
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
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  withOverrides: withTable,
}).extend((editor) => ({
  options: {
    cellFactory: (options: any) => getEmptyCellNode(editor, options),
    getCellChildren: (cell: any) => cell.children,
  },
}));
