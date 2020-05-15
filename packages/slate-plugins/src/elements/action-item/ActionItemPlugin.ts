import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { deserializeActionItem } from 'elements/action-item/deserializeActionItem';
import { renderElementActionItem } from './renderElementActionItem';

export const ActionItemPlugin = (
  options?: RenderElementOptions & { typeActionItem?: string }
): SlatePlugin => ({
  renderElement: renderElementActionItem(options),
  deserialize: deserializeActionItem(options),
});
