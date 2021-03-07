import { getRenderElements, setDefaults } from '@udecode/slate-plugins-common';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import {
  CodeBlockRenderElementOptions,
  CodeLineRenderElementOptions,
} from './types';

export const renderElementCodeBlock = (
  options?: CodeBlockRenderElementOptions & CodeLineRenderElementOptions
) => {
  const { code_block, code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return getRenderElements([code_block, code_line]);
};
