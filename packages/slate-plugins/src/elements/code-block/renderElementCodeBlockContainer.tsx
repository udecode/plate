import { getRenderElements } from '../../common/utils/getRenderElement';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { CodeBlockContainerRenderElementOptions } from './types';

export const renderElementCodeBlockContainer = (
  options?: CodeBlockContainerRenderElementOptions
) => {
  const { code_block_container } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return getRenderElements([code_block_container]);
};
