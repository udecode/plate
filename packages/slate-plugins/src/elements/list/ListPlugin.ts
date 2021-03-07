import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';
import { deserializeList } from './deserializeList';
import { onKeyDownList } from './onKeyDownList';
import { renderElementList } from './renderElementList';
import { ListPluginOptions } from './types';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const ListPlugin = (options?: ListPluginOptions): SlatePlugin => ({
  elementKeys: [ELEMENT_UL, ELEMENT_OL, ELEMENT_LI],
  renderElement: renderElementList(options),
  deserialize: deserializeList(options),
  onKeyDown: onKeyDownList(options),
});
