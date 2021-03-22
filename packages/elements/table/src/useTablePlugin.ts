import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_TABLE } from './defaults';
import { useDeserializeTable } from './useDeserializeTable';
import { useOnKeyDownTable } from './useOnKeyDownTable';
import { withTable } from './withTable';

/**
 * Enables support for tables.
 */
export const useTablePlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_TABLE,
  renderElement: useRenderElement(KEYS_TABLE),
  deserialize: useDeserializeTable(),
  onKeyDown: useOnKeyDownTable(),
  withOverrides: withTable(),
});
