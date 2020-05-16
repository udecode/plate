import { getRenderElement, RenderElementOptions } from 'element';
import { ActionItemElement } from './components';
import { ACTION_ITEM } from './types';

export const renderElementActionItem = ({
  typeActionItem = ACTION_ITEM,
  component = ActionItemElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeActionItem,
    component,
  });
