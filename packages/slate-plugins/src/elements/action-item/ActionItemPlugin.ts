import { SlatePlugin } from 'common/types';
import { deserializeActionItem } from 'elements/action-item/deserializeActionItem';
import { ActionItemPluginOptions } from 'elements/action-item/types';
import { renderElementActionItem } from './renderElementActionItem';

export const ActionItemPlugin = (
  options?: ActionItemPluginOptions
): SlatePlugin => ({
  renderElement: renderElementActionItem(options),
  deserialize: deserializeActionItem(options),
});
