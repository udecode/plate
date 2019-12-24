import { SlatePlugin } from 'slate-plugins/types';
import { deserializeList } from './deserializeList';
import { renderElementList } from './renderElementList';

export const ListPlugin = (): SlatePlugin => ({
  renderElement: renderElementList(),
  deserialize: deserializeList(),
});
