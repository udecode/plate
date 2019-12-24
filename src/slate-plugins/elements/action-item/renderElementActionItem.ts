import { getRenderElement } from '../utils';
import { ActionItemElement } from './components';
import { ACTION_ITEM } from './types';

export const renderElementActionItem = getRenderElement({
  type: ACTION_ITEM,
  component: ActionItemElement,
});
