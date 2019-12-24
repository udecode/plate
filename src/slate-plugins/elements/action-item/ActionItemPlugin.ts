import { SlatePlugin } from 'slate-plugins/types';
import { RenderElementOptions } from '../types';
import { renderElementActionItem } from './renderElementActionItem';

export const ActionItemPlugin = (
  options?: RenderElementOptions
): SlatePlugin => ({
  renderElement: renderElementActionItem(options),
});
