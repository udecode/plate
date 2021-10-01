import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { DEFAULTS_CODE_BLOCK, KEYS_CODE_BLOCK } from './defaults';
import { getCodeBlockDeserialize } from './getCodeBlockDeserialize';
import { getCodeBlockOnKeyDown } from './getCodeBlockOnKeyDown';
import { getCodeBlockRenderLeaf } from './getCodeBlockRenderLeaf';
import { getCodeLineDecorate } from './getCodeLineDecorate';
import { CodeBlockPluginOptions } from './types';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugin = ({
  syntax = DEFAULTS_CODE_BLOCK?.syntax,
  syntaxPopularFirst = DEFAULTS_CODE_BLOCK?.syntaxPopularFirst,
}: CodeBlockPluginOptions = {}): PlatePlugin => ({
  pluginKeys: KEYS_CODE_BLOCK,
  renderElement: getRenderElement(KEYS_CODE_BLOCK),
  renderLeaf: getCodeBlockRenderLeaf(),
  deserialize: getCodeBlockDeserialize(),
  decorate: getCodeLineDecorate(),
  onKeyDown: getCodeBlockOnKeyDown(),
  withOverrides: withCodeBlock(),
});
