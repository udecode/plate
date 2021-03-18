import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_TABLE } from './defaults';
import { useDeserializeTable } from './useDeserializeTable';
import { useOnKeyDownTable } from './useOnKeyDownTable';

/**
 * Enables support for tables.
 */
export const TablePlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_TABLE,
  renderElement: getPluginRenderElement(KEYS_TABLE),
  deserialize: useDeserializeTable(),
  onKeyDown: useOnKeyDownTable(),
});
