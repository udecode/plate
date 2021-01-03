import { SlatePlugin } from '@udecode/slate-plugins-core';
import { deserializeTable } from './deserializeTable';
import { onKeyDownTable } from './onKeyDownTable';
import { renderElementTable } from './renderElementTable';
import { TablePluginOptions } from './types';

/**
 * Enables support for tables.
 */
export const TablePlugin = (options?: TablePluginOptions): SlatePlugin => ({
  renderElement: renderElementTable(options),
  deserialize: deserializeTable(options),
  onKeyDown: onKeyDownTable(options),
});
