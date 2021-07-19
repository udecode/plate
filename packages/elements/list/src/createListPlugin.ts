import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { KEYS_LIST } from './defaults';
import { getListDeserialize } from './getListDeserialize';
import { getListOnKeyDown } from './getListOnKeyDown';
import { WithListOptions } from './types';
import { withList } from './withList';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const createListPlugin = (options?: WithListOptions): PlatePlugin => ({
  pluginKeys: KEYS_LIST,
  renderElement: getRenderElement(KEYS_LIST),
  deserialize: getListDeserialize(),
  onKeyDown: getListOnKeyDown(KEYS_LIST),
  withOverrides: withList(options),
});
