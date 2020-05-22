import { SlatePlugin } from 'common/types';
import { deserializeCodeBlock } from 'elements/code-block/deserializeCodeBlock';
import { renderElementCodeBlock } from 'elements/code-block/renderElementCodeBlock';
import { CodeBlockPluginOptions } from 'elements/code-block/types';

export const CodeBlockPlugin = (
  options?: CodeBlockPluginOptions
): SlatePlugin => ({
  renderElement: renderElementCodeBlock(options),
  deserialize: deserializeCodeBlock(options),
});
