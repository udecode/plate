import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeCode } from '../code/useDeserializeCode';
import { MARK_ITALIC } from './defaults';

/**
 * Enables support for italic formatting.
 */
export const ItalicPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_ITALIC),
  deserialize: useDeserializeCode(),
  onKeyDown: getPluginOnKeyDownMark(MARK_ITALIC),
});
