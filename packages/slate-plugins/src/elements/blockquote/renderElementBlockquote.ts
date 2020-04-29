import { RenderElementOptions } from 'elements/types';
import { getRenderElement } from '../utils';
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
