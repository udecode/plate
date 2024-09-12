import {
  type HtmlDeserializer,
  bindFirst,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { TableApi, TableConfig } from './types';

import { insertTableColumn, insertTableRow } from './transforms/index';
import { getEmptyCellNode } from './utils';
import { withTable } from './withTable';

export const BaseTableRowPlugin = createSlatePlugin({
  key: 'tr',
  node: { isElement: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
  },
});

export const BaseTableCellPlugin = createSlatePlugin({
  key: 'td',
  node: { isElement: true },
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse: getParse(type),
        rules: [{ validNodeName: 'TD' }],
      },
    },
  },
}));

export const BaseTableCellHeaderPlugin = createSlatePlugin({
  key: 'th',
  node: { isElement: true },
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse: getParse(type),
        rules: [{ validNodeName: 'TH' }],
      },
    },
  },
}));

/** Enables support for tables. */
export const BaseTablePlugin = createTSlatePlugin<TableConfig>({
  extendEditor: withTable,
  key: 'table',
  node: { isElement: true },
  options: {
    _cellIndices: new WeakMap(),
    enableMerging: false,
    minColumnWidth: 48,
  },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TABLE' }],
      },
    },
  },
  plugins: [BaseTableRowPlugin, BaseTableCellPlugin, BaseTableCellHeaderPlugin],
})
  .extendEditorApi<TableApi>(({ editor }) => ({
    create: {
      cell: bindFirst(getEmptyCellNode, editor),
    },
    table: {
      getCellChildren: (cell) => cell.children,
    },
  }))
  .extendEditorTransforms(({ editor }) => ({
    insert: {
      tableColumn: bindFirst(insertTableColumn, editor),
      tableRow: bindFirst(insertTableRow, editor),
    },
  }));

const getParse = (type: string): HtmlDeserializer['parse'] => {
  return ({ element }) => {
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
};
