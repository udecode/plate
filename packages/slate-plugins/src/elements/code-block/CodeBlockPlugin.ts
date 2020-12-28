/**
 * Enables support for pre-formatted code blocks.
 */
import { getOnHotkeyToggleNodeTypeDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { decorateCodeBlock } from './decorateCodeBlock';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { deserializeCodeBlock } from './deserializeCodeBlock';
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
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: 'code_block',
    defaultOptions: DEFAULTS_CODE_BLOCK,
    options,
  }),
});
