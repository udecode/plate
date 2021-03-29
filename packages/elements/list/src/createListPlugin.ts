import { getRenderElement, SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_LIST } from './defaults';
import { getListDeserialize } from './getListDeserialize';
import { getListOnKeyDown } from './getListOnKeyDown';
import { WithListOptions } from './types';
import { withList } from './withList';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const createListPlugin = (options?: WithListOptions): SlatePlugin => ({
  pluginKeys: KEYS_LIST,
  renderElement: getRenderElement(KEYS_LIST),
  deserialize: getListDeserialize(),
  onKeyDown: getListOnKeyDown(),
  withOverrides: withList(options),
});
