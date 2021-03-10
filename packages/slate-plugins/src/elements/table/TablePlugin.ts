import { useRenderElements } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_TABLE } from './defaults';
import { useDeserializeTable } from './useDeserializeTable';
import { useOnKeyDownTable } from './useOnKeyDownTable';

/**
 * Enables support for tables.
 */
export const TablePlugin = (): SlatePlugin => ({
  elementKeys: KEYS_TABLE,
  renderElement: useRenderElements(KEYS_TABLE),
  deserialize: useDeserializeTable(),
  onKeyDown: useOnKeyDownTable(),
});
