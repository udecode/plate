import { SlatePlugin } from '../../common';
import { onKeyDownMark } from '../../mark';
import { deserializeCode } from './deserializeCode';
import { renderLeafCode } from './renderLeafCode';
import { CodePluginOptions, MARK_CODE } from './types';

/**
 * Enables support for inline code formatting.
 */
export const CodePlugin = (options: CodePluginOptions = {}): SlatePlugin => ({
  renderLeaf: renderLeafCode(options),
  deserialize: deserializeCode(options),
  onKeyDown: onKeyDownMark(
    options.typeCode ?? MARK_CODE,
    options.hotkey ?? 'mod+`'
  ),
});
