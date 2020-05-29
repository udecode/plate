import { SlatePlugin } from '../../common';
import { deserializeTable } from './deserializeTable';
import { renderElementTable } from './renderElementTable';
import { TablePluginOptions } from './types';

/**
 * Enables support for tables.
 */
export const TablePlugin = (options?: TablePluginOptions): SlatePlugin => ({
  renderElement: renderElementTable(options),
  deserialize: deserializeTable(options),
});
