import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
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
    pluginKeys: ELEMENT_TABLE,
    renderElement: getRenderElement(ELEMENT_TABLE),
    deserialize: getTableDeserialize(),
    onKeyDown: getTableOnKeyDown(),
    withOverrides: withTable(),
  },
  {
    pluginKeys: ELEMENT_TR,
    renderElement: getRenderElement(ELEMENT_TR),
    deserialize: getTrDeserialize(),
  },
  {
    pluginKeys: ELEMENT_TD,
    renderElement: getRenderElement(ELEMENT_TD),
    deserialize: getTdDeserialize(),
  },
  {
    pluginKeys: ELEMENT_TH,
    renderElement: getRenderElement(ELEMENT_TH),
    deserialize: getThDeserialize(),
  },
];
