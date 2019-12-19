import { SlatePlugin } from 'slate-react';
import { renderElementTable } from './renderElementTable';
import { withTable } from './withTable';

export const TablePlugin = (): SlatePlugin => ({
  editor: withTable,
  renderElement: renderElementTable,
});
