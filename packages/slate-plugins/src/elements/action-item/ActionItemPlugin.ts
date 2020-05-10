import { SlatePlugin } from 'common/types';
import { RenderElementOptions } from 'element';
import { renderElementActionItem } from './renderElementActionItem';

export const ActionItemPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementActionItem(options),
});
