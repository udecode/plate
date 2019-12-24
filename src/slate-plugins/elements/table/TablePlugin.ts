import { SlatePlugin } from 'slate-plugins/types';
import { deserializeTable } from './deserializeTable';
import { renderElementTable } from './renderElementTable';

export const TablePlugin = (): SlatePlugin => ({
  renderElement: renderElementTable(),
  deserialize: deserializeTable(),
});
