/**
 * Enables support for pre-formatted code blocks.
 */
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { setDefaults } from '../../common/utils/setDefaults';
import { decorateCodeBlock } from './decorateCodeBlock';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { deserializeCodeBlock } from './deserializeCodeBlock';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';
import { renderElementCodeBlock } from './renderElementCodeBlock';
import { renderLeafCodeBlock } from './renderLeafCodeBlock';
import {
  CodeBlockContainerPluginOptions,
  CodeBlockPluginOptions,
} from './types';

export const CodeBlockPlugin = (
  options?: CodeBlockPluginOptions & CodeBlockContainerPluginOptions
): SlatePlugin => {
  const { code_block_container } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  return {
    renderElement: renderElementCodeBlock(options),
    renderLeaf: renderLeafCodeBlock(),
    deserialize: deserializeCodeBlock(options),
    decorate: decorateCodeBlock(),
    onKeyDown: onKeyDownCodeBlock(options),
    voidTypes: [code_block_container.type],
  };
};
