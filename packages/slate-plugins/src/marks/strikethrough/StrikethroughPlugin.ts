import {
  getPluginOnKeyDownMark,
  getPluginRenderLeaf,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeUnderline } from '../underline/useDeserializeUnderline';
import { MARK_STRIKETHROUGH } from './defaults';

/**
 * Enables support for strikethrough formatting.
 */
export const StrikethroughPlugin = (): SlatePlugin => ({
  renderLeaf: getPluginRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: useDeserializeUnderline(),
  onKeyDown: getPluginOnKeyDownMark(MARK_STRIKETHROUGH),
});
