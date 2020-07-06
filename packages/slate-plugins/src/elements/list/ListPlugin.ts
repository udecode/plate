import { SlatePlugin } from '@udecode/slate-plugins-core';
import { deserializeList } from './deserializeList';
import { onKeyDownList } from './onKeyDownList';
import { renderElementList } from './renderElementList';
import { ListPluginOptions } from './types';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const ListPlugin = (options?: ListPluginOptions): SlatePlugin => ({
  renderElement: renderElementList(options),
  deserialize: deserializeList(options),
  onKeyDown: onKeyDownList(options),
});
