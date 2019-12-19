import { SlatePlugin } from 'slate-react';
import { renderElementList } from './renderElementList';
import { withList } from './withList';

export const ListPlugin = (): SlatePlugin => ({
  editor: withList,
  renderElement: renderElementList(),
});
