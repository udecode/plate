import {
  useOnKeyDownElement,
  useRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';
import { useDeserializeBlockquote } from './useDeserializeBlockquote';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const useBlockquotePlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_BLOCKQUOTE,
  renderElement: useRenderElement(ELEMENT_BLOCKQUOTE),
  deserialize: useDeserializeBlockquote(),
  onKeyDown: useOnKeyDownElement(ELEMENT_BLOCKQUOTE),
});
