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

export const TableRowPlugin = createSlatePlugin({
  isElement: true,
  key: 'tr',
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
  },
});

export const TableCellPlugin = createSlatePlugin({
  isElement: true,
  key: 'td',
}).extend(({ editor }) => ({
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse: getParse(editor.getType({ key: 'td' })),
        rules: [{ validNodeName: 'TD' }],
      },
    },
  },
}));

export const TableCellHeaderPlugin = createSlatePlugin({
  isElement: true,
  key: 'th',
}).extend(({ editor }) => ({
  parsers: {
    html: {
      deserializer: {
        attributeNames: ['rowspan', 'colspan'],
        parse: getParse(editor.getType({ key: 'th' })),
        rules: [{ validNodeName: 'TH' }],
      },
    },
  },
}));

/** Enables support for tables. */
export const TablePlugin = createTSlatePlugin<TableConfig>({
  isElement: true,
  key: 'table',
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
  plugins: [TableRowPlugin, TableCellPlugin, TableCellHeaderPlugin],
  withOverrides: withTable,
})
  .extendApi<TableApi>(({ editor }) => ({
    cellFactory: bindFirst(getEmptyCellNode, editor),
    getCellChildren: (cell) => cell.children,
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
