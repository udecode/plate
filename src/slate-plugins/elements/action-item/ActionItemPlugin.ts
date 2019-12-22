import { SlatePlugin } from 'slate-react';
import { renderElementActionItem } from './renderElementActionItem';

export const ActionItemPlugin = (): SlatePlugin => ({
  renderElement: renderElementActionItem(),
});
