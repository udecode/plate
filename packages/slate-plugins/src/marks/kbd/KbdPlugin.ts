import { useOnKeyDownMark, useRenderLeaf } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useDeserializeCode } from '../code/useDeserializeCode';
import { MARK_KBD } from './defaults';

/**
 * Enables support for code formatting
 */
export const KbdPlugin = (): SlatePlugin => ({
  renderLeaf: useRenderLeaf(MARK_KBD),
  deserialize: useDeserializeCode(),
  onKeyDown: useOnKeyDownMark(MARK_KBD),
});
