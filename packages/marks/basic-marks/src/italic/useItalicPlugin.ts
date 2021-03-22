import { useOnKeyDownMark, useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeCode } from '../code/useDeserializeCode';
import { MARK_ITALIC } from './defaults';

/**
 * Enables support for italic formatting.
 */
export const useItalicPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_ITALIC,
  renderLeaf: useRenderLeaf(MARK_ITALIC),
  deserialize: useDeserializeCode(),
  onKeyDown: useOnKeyDownMark(MARK_ITALIC),
});
