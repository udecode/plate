import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_CODE } from './defaults';
import { useDeserializeCode } from './useDeserializeCode';

/**
 * Enables support for code formatting
 */
export const CodePlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_CODE),
  deserialize: useDeserializeCode(),
  onKeyDown: getPluginOnKeyDownMark(MARK_CODE),
});
