import { SlatePlugin } from 'slate-react';
import { deserializeList } from './deserializeList';
import { renderElementList } from './renderElementList';

export const ListPlugin = (): SlatePlugin => ({
  renderElement: renderElementList(),
  deserialize: deserializeList(),
});
