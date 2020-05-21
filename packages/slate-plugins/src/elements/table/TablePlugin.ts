import { SlatePlugin } from 'common/types';
import { deserializeTable } from './deserializeTable';
import { renderElementTable } from './renderElementTable';
import { TablePluginOptions } from './types';

export const TablePlugin = (options?: TablePluginOptions): SlatePlugin => ({
  renderElement: renderElementTable(options),
  deserialize: deserializeTable(options),
});
