import { SlatePlugin } from 'slate-plugins/types';
import { renderElementActionItem } from './renderElementActionItem';

export const ActionItemPlugin = (): SlatePlugin => ({
  renderElement: renderElementActionItem(),
});
