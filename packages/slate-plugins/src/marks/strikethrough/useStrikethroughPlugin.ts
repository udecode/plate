import { useOnKeyDownMark, useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeUnderline } from '../underline/useDeserializeUnderline';
import { MARK_STRIKETHROUGH } from './defaults';

/**
 * Enables support for strikethrough formatting.
 */
export const useStrikethroughPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_STRIKETHROUGH,
  renderLeaf: useRenderLeaf(MARK_STRIKETHROUGH),
  deserialize: useDeserializeUnderline(),
  onKeyDown: useOnKeyDownMark(MARK_STRIKETHROUGH),
});
