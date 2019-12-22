import { SlatePlugin } from 'slate-react';
import { renderElementTable } from './renderElementTable';

export const TablePlugin = (): SlatePlugin => ({
  renderElement: renderElementTable,
});
