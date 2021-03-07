import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from './defaults';
import { deserializeTable } from './deserializeTable';
import { onKeyDownTable } from './onKeyDownTable';
import { renderElementTable } from './renderElementTable';
import { TablePluginOptions } from './types';

/**
 * Enables support for tables.
 */
export const TablePlugin = (options?: TablePluginOptions): SlatePlugin => ({
  elementKeys: [ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR, ELEMENT_TD],
  renderElement: renderElementTable(options),
  deserialize: deserializeTable(options),
  onKeyDown: onKeyDownTable(options),
});
