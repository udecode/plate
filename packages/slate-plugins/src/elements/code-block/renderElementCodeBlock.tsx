import { getRenderElements } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import {
  CodeBlockLineRenderElementOptions,
  CodeBlockRenderElementOptions,
} from './types';

export const renderElementCodeBlock = (
  options?: CodeBlockRenderElementOptions & CodeBlockLineRenderElementOptions
) => {
  const { code_block, code_block_line } = setDefaults(
    options,
    DEFAULTS_CODE_BLOCK
  );

  return getRenderElements([code_block, code_block_line]);
};
