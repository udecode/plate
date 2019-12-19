import { SlatePlugin } from 'slate-react';
import { renderElementCheckList } from './renderElementCheckList';

export const CheckListPlugin = (): SlatePlugin => ({
  renderElement: renderElementCheckList(),
});
