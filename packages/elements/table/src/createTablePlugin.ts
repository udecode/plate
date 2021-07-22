import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { KEYS_TABLE } from './defaults';
import { getTableDeserialize } from './getTableDeserialize';
import { getTableOnKeyDown } from './getTableOnKeyDown';
import { withTable } from './withTable';

/**
 * Enables support for tables.
 */
export const createTablePlugin = (): PlatePlugin => ({
  pluginKeys: KEYS_TABLE,
  renderElement: getRenderElement(KEYS_TABLE),
  deserialize: getTableDeserialize(),
  onKeyDown: getTableOnKeyDown(),
  withOverrides: withTable(),
});
