import { SlatePlugin } from 'common/types';
import { onKeyDownMark } from 'mark';
import { deserializeCode } from 'marks/code/deserializeCode';
import { renderLeafCode } from 'marks/code/renderLeafCode';
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
