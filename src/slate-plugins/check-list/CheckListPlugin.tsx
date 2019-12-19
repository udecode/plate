import { SlatePlugin } from 'slate-react';
import { renderElementCheckList } from './renderElementCheckList';
import { withChecklist } from './withChecklist';

export const CheckListPlugin = (): SlatePlugin => ({
  editor: withChecklist,
  renderElement: renderElementCheckList(),
});
