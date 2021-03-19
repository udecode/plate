import { useRenderElement } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { KEYS_LIST } from './defaults';
import { WithListOptions } from './types';
import { useDeserializeList } from './useDeserializeList';
import { useOnKeyDownList } from './useOnKeyDownList';
import { withList } from './withList';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const useListPlugin = (options?: WithListOptions): SlatePlugin => ({
  pluginKeys: KEYS_LIST,
  renderElement: useRenderElement(KEYS_LIST),
  deserialize: useDeserializeList(),
  onKeyDown: useOnKeyDownList(),
  withOverrides: withList(options),
});
