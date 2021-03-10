import { useOnKeyDownMark, useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_UNDERLINE } from './defaults';
import { useDeserializeUnderline } from './useDeserializeUnderline';

/**
 * Enables support for underline formatting.
 */
export const UnderlinePlugin = (): SlatePlugin => ({
  renderLeaf: useRenderLeaf(MARK_UNDERLINE),
  deserialize: useDeserializeUnderline(),
  onKeyDown: useOnKeyDownMark(MARK_UNDERLINE),
});
