import { SlatePlugin } from 'slate-react';
import { renderElementList } from './renderElementList';

export const ListPlugin = (): SlatePlugin => ({
  renderElement: renderElementList(),
});
