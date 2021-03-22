import { useOnKeyDownMark, useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { MARK_KBD } from './defaults';
import { useDeserializeKbd } from './useDeserializeKbd';

/**
 * Enables support for code formatting
 */
export const useKbdPlugin = (): SlatePlugin => ({
  pluginKeys: MARK_KBD,
  renderLeaf: useRenderLeaf(MARK_KBD),
  deserialize: useDeserializeKbd(),
  onKeyDown: useOnKeyDownMark(MARK_KBD),
});
