import { createPluginFactory } from '@udecode/plate-core';
import { onKeyDownTable } from './onKeyDownTable';
import { withTable } from './withTable';

export const ELEMENT_TABLE = 'table';
export const ELEMENT_TH = 'th';
export const ELEMENT_TR = 'tr';
export const ELEMENT_TD = 'td';

/**
 * Enables support for tables.
 */
export const createTablePlugin = createPluginFactory({
  key: ELEMENT_TABLE,
  isElement: true,
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  deserializeHtml: {
    rules: [{ validNodeName: 'TABLE' }],
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
