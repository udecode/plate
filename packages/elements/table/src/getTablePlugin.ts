import { getRenderElement, SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_TABLE } from './defaults';
import { getTableDeserialize } from './getTableDeserialize';
import { getTableOnKeyDown } from './getTableOnKeyDown';
import { withTable } from './withTable';

/**
 * Enables support for tables.
 */
export const getTablePlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_TABLE,
  renderElement: getRenderElement(KEYS_TABLE),
  deserialize: getTableDeserialize(),
  onKeyDown: getTableOnKeyDown(),
  withOverrides: withTable(),
});
