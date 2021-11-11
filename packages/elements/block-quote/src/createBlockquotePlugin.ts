import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';
import { getBlockquoteDeserialize } from './getBlockquoteDeserialize';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const createBlockquotePlugin = (): PlatePlugin => ({
  key: ELEMENT_BLOCKQUOTE,
  isElement: true,
  deserialize: getBlockquoteDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_BLOCKQUOTE),
});
