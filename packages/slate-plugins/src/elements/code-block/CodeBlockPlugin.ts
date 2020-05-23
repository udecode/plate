import { SlatePlugin } from 'common/types';
import { deserializeCodeBlock } from 'elements/code-block/deserializeCodeBlock';
import { renderElementCodeBlock } from 'elements/code-block/renderElementCodeBlock';
import { CodeBlockPluginOptions } from 'elements/code-block/types';

/**
 * Enables support for pre-formatted code blocks.
 */
export const CodeBlockPlugin = (
  options?: CodeBlockPluginOptions
): SlatePlugin => ({
  renderElement: renderElementCodeBlock(options),
  deserialize: deserializeCodeBlock(options),
});
