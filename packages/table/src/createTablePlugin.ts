import { createPluginFactory } from '@udecode/plate-common/server';

import type { TablePlugin, TableStoreCellAttributes } from './types';

import { onKeyDownTable } from './onKeyDownTable';
import { insertTableColumn, insertTableRow } from './transforms/index';
import { withTable } from './withTable';

export const ELEMENT_TABLE = 'table';

export const ELEMENT_TH = 'th';

export const ELEMENT_TR = 'tr';

export const ELEMENT_TD = 'td';

/** Enables support for tables. */
export const createTablePlugin = createPluginFactory<TablePlugin>({
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
  plugins: [
    {
      deserializeHtml: {
        rules: [{ validNodeName: 'TR' }],
      },
      isElement: true,
      key: ELEMENT_TR,
    },
    {
      deserializeHtml: {
        attributeNames: ['rowspan', 'colspan'],
        getNode: (element) => {
          const background =
            element.style.background || element.style.backgroundColor;

          if (background) {
            return {
              background,
              type: 'td',
            };
          }

          return { type: 'td' };
        },
        rules: [{ validNodeName: 'TD' }],
      },
      isElement: true,
      key: ELEMENT_TD,
      props: ({ element }) => ({
        nodeProps: {
          colSpan: (element?.attributes as any)?.colspan,
          rowSpan: (element?.attributes as any)?.rowspan,
        },
      }),
    },
    {
      deserializeHtml: {
        attributeNames: ['rowspan', 'colspan'],
        getNode: (element) => {
          const background =
            element.style.background || element.style.backgroundColor;

          if (background) {
            return {
              background,
              type: 'th',
            };
          }

          return { type: 'th' };
        },
        rules: [{ validNodeName: 'TH' }],
      },
      isElement: true,
      key: ELEMENT_TH,
      props: ({ element }) => ({
        nodeProps: {
          colSpan: (element?.attributes as any)?.colspan,
          rowSpan: (element?.attributes as any)?.rowspan,
        },
      }),
    },
  ],
  withOverrides: withTable,
});
