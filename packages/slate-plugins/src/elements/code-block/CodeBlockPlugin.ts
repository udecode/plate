import { SlatePlugin } from '@udecode/slate-plugins-core';
import { decorateCodeBlock } from './decorateCodeBlock';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './defaults';
import { deserializeCodeBlock } from './deserializeCodeBlock';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';
import { renderElementCodeBlock } from './renderElementCodeBlock';
import { renderLeafCodeBlock } from './renderLeafCodeBlock';
import { CodeBlockPluginOptions } from './types';

/**
 * Enables support for pre-formatted code blocks.
 */
export const CodeBlockPlugin = (
  options?: CodeBlockPluginOptions
): SlatePlugin => ({
  elementKeys: [ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE],
  renderElement: renderElementCodeBlock(options),
  renderLeaf: renderLeafCodeBlock(),
  deserialize: deserializeCodeBlock(options),
  decorate: decorateCodeBlock(),
  onKeyDown: onKeyDownCodeBlock(options),
});
