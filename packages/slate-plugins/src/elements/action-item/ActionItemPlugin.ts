import { SlatePlugin } from '@udecode/core';
import { deserializeActionItem } from './deserializeActionItem';
import { renderElementActionItem } from './renderElementActionItem';
import { ActionItemPluginOptions } from './types';

export const ActionItemPlugin = (
  options?: ActionItemPluginOptions
): SlatePlugin => ({
  renderElement: renderElementActionItem(options),
  deserialize: deserializeActionItem(options),
});
