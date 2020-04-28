import { SlatePlugin } from 'types';
import { deserializeTable } from './deserializeTable';
import { renderElementTable } from './renderElementTable';
import { RenderElementTableOptions } from './types';

export const TablePlugin = (
  options?: RenderElementTableOptions
): SlatePlugin => ({
  renderElement: renderElementTable(options),
  deserialize: deserializeTable(options),
});
