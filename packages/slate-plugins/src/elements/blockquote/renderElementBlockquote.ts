import { getRenderElement, RenderElementOptions } from 'element';
import { BlockquoteElement } from './components';
import { BLOCKQUOTE } from './types';

export const renderElementBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
  component = BlockquoteElement,
}: RenderElementOptions = {}) =>
  getRenderElement({
    type: typeBlockquote,
    component,
  });
