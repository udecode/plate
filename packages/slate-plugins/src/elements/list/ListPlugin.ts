import { getPluginRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_LIST } from './defaults';
import { useDeserializeList } from './useDeserializeList';
import { useOnKeyDownList } from './useOnKeyDownList';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const ListPlugin = (): SlatePlugin => ({
  pluginKeys: KEYS_LIST,
  renderElement: getPluginRenderElement(KEYS_LIST),
  deserialize: useDeserializeList(),
  onKeyDown: useOnKeyDownList(),
});
