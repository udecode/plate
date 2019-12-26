import { getRenderElement } from '../utils';
import { BlockquoteElement } from './components';
import { BLOCKQUOTE } from './types';

export const renderElementBlockquote = getRenderElement({
  type: BLOCKQUOTE,
  component: BlockquoteElement,
});
