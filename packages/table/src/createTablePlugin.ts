import { createPluginFactory } from '@udecode/plate-common';
import { insertTableColumn, insertTableRow } from './transforms/index';
import { onKeyDownTable } from './onKeyDownTable';
import { TablePlugin } from './types';
import { withTable } from './withTable';

export const ELEMENT_TABLE = 'table';
export const ELEMENT_TH = 'th';
export const ELEMENT_TR = 'tr';
export const ELEMENT_TD = 'td';

/**
 * Enables support for tables.
 */
export const createTablePlugin = createPluginFactory<TablePlugin>({
  key: ELEMENT_TABLE,
  isElement: true,
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
  },
  options: {
    insertColumn: (e, { fromCell }) => {
      insertTableColumn(e, {
        fromCell,
        disableSelect: true,
      });
    },
    insertRow: (e, { fromRow }) => {
      insertTableRow(e, {
        fromRow,
        disableSelect: true,
      });
    },
    minColumnWidth: 48,
  },
  withOverrides: withTable,
  plugins: [
    {
      key: ELEMENT_TR,
      isElement: true,
      deserializeHtml: {
        rules: [{ validNodeName: 'TR' }],
      },
    },
    {
      key: ELEMENT_TD,
      isElement: true,
      deserializeHtml: {
        attributeNames: ['rowspan', 'colspan'],
        rules: [{ validNodeName: 'TD' }],
      },
      props: ({ element }) => ({
        nodeProps: {
          colSpan: (element?.attributes as any)?.colspan,
          rowSpan: (element?.attributes as any)?.rowspan,
        },
      }),
    },
    {
      key: ELEMENT_TH,
      isElement: true,
      deserializeHtml: {
        attributeNames: ['rowspan', 'colspan'],
        rules: [{ validNodeName: 'TH' }],
      },
      props: ({ element }) => ({
        nodeProps: {
          colSpan: (element?.attributes as any)?.colspan,
          rowSpan: (element?.attributes as any)?.rowspan,
        },
      }),
    },
  ],
});
