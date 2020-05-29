import { getRenderElement } from '../../element/utils';
import { BlockquoteElement } from './components';
import { BLOCKQUOTE, BlockquoteRenderElementOptions } from './types';

export const renderElementBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
  component = BlockquoteElement,
}: BlockquoteRenderElementOptions = {}) =>
  getRenderElement({
    type: typeBlockquote,
    component,
  });
