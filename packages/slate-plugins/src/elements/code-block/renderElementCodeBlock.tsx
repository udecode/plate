import { getRenderElement } from '../../common/utils/getRenderElement';
import { CodeBlockElement } from './components';
import { CODE_BLOCK, CodeBlockRenderElementOptions } from './types';

export const renderElementCodeBlock = ({
  typeCodeBlock = CODE_BLOCK,
  component = CodeBlockElement,
}: CodeBlockRenderElementOptions = {}) =>
  getRenderElement({
    type: typeCodeBlock,
    component,
  });
