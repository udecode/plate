/**
 * Enables support for pre-formatted code blocks.
 */
import { SlatePlugin } from '../../common';
import { deserializeCodeBlock } from './deserializeCodeBlock';
import { renderElementCodeBlock } from './renderElementCodeBlock';
import { CodeBlockPluginOptions } from './types';

export const CodeBlockPlugin = (
  options?: CodeBlockPluginOptions
): SlatePlugin => ({
  renderElement: renderElementCodeBlock(options),
  deserialize: deserializeCodeBlock(options),
});
