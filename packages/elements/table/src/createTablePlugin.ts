import { createPluginFactory } from '@udecode/plate-core';
import {
  getTableDeserialize,
  getTdDeserialize,
  getThDeserialize,
  getTrDeserialize,
} from './getTableDeserialize';
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
  deserialize: getTableDeserialize(),
  handlers: {
    onKeyDown: onKeyDownTable,
  },
  withOverrides: withTable,
  plugins: [
    {
      key: ELEMENT_TR,
      isElement: true,
      deserialize: getTrDeserialize(),
    },
    {
      key: ELEMENT_TD,
      isElement: true,
      deserialize: getTdDeserialize(),
      props: ({ element }) => ({
        nodeProps: {
          colSpan: element?.attributes?.colspan,
          rowSpan: element?.attributes?.rowspan,
        },
      }),
    },
    {
      key: ELEMENT_TH,
      isElement: true,
      deserialize: getThDeserialize(),
      props: ({ element }) => ({
        nodeProps: {
          colSpan: element?.attributes?.colspan,
          rowSpan: element?.attributes?.rowspan,
        },
      }),
    },
  ],
});
