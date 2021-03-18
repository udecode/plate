import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeCode } from '../code/useDeserializeCode';
import { MARK_KBD } from './defaults';

/**
 * Enables support for code formatting
 */
export const KbdPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_KBD),
  deserialize: useDeserializeCode(),
  onKeyDown: getPluginOnKeyDownMark(MARK_KBD),
});
