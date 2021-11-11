import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from './defaults';
import {
  getTableDeserialize,
  getTdDeserialize,
  getThDeserialize,
  getTrDeserialize,
} from './getTableDeserialize';
import { getTableOnKeyDown } from './getTableOnKeyDown';
import { withTable } from './withTable';

/**
 * Enables support for tables.
 */
export const createTablePlugins = (): PlatePlugin[] => [
  {
    key: ELEMENT_TABLE,
    isElement: true,
    deserialize: getTableDeserialize(),
    onKeyDown: getTableOnKeyDown(),
    withOverrides: withTable(),
  },
  {
    key: ELEMENT_TR,
    isElement: true,
    deserialize: getTrDeserialize(),
  },
  {
    key: ELEMENT_TD,
    isElement: true,
    deserialize: getTdDeserialize(),
  },
  {
    key: ELEMENT_TH,
    isElement: true,
    deserialize: getThDeserialize(),
  },
];
