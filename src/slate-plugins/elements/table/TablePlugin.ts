import { SlatePlugin } from 'slate-react';
import { deserializeTable } from './deserializeTable';
import { renderElementTable } from './renderElementTable';

export const TablePlugin = (): SlatePlugin => ({
  renderElement: renderElementTable(),
  deserialize: deserializeTable(),
});
