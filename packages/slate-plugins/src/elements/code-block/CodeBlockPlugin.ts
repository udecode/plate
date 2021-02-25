/**
 * Enables support for pre-formatted code blocks.
 */
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { decorateCodeBlock } from './decorateCodeBlock';
import { deserializeCodeBlock } from './deserializeCodeBlock';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';
import { renderElementCodeBlock } from './renderElementCodeBlock';
import { renderLeafCodeBlock } from './renderLeafCodeBlock';
import { CodeBlockPluginOptions } from './types';

export const CodeBlockPlugin = (
  options?: CodeBlockPluginOptions
): SlatePlugin => ({
  renderElement: renderElementCodeBlock(options),
  renderLeaf: renderLeafCodeBlock(),
  deserialize: deserializeCodeBlock(options),
  decorate: decorateCodeBlock(),
  onKeyDown: onKeyDownCodeBlock(options),
});
