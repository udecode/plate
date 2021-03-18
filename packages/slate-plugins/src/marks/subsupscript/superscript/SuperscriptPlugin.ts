import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeUnderline } from '../../underline/useDeserializeUnderline';
import { MARK_SUPERSCRIPT } from '../defaults';

/**
 * Enables support for superscript formatting.
 */
export const SuperscriptPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_SUPERSCRIPT),
  deserialize: useDeserializeUnderline(),
  onKeyDown: getPluginOnKeyDownMark(MARK_SUPERSCRIPT),
});
