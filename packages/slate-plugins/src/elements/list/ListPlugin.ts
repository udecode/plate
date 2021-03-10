import { useRenderElements } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_LIST } from './defaults';
import { useDeserializeList } from './useDeserializeList';
import { useOnKeyDownList } from './useOnKeyDownList';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const ListPlugin = (): SlatePlugin => ({
  elementKeys: KEYS_LIST,
  renderElement: useRenderElements(KEYS_LIST),
  deserialize: useDeserializeList(),
  onKeyDown: useOnKeyDownList(),
});
