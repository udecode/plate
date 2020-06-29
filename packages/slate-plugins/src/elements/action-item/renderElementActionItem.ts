import { getRenderElement } from '@udecode/core';
import { ActionItemElement } from './components';
import { ACTION_ITEM, ActionItemRenderElementOptions } from './types';

export const renderElementActionItem = ({
  typeActionItem = ACTION_ITEM,
  component = ActionItemElement,
}: ActionItemRenderElementOptions = {}) =>
  getRenderElement({
    type: typeActionItem,
    component,
  });
