import { BlockquoteElement } from './components/BlockquoteElement';
import { BlockquoteKeyOption, BlockquotePluginOptionsValues } from './types';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

export const DEFAULTS_BLOCKQUOTE: Record<
  BlockquoteKeyOption,
  Required<BlockquotePluginOptionsValues>
> = {
  blockquote: {
    component: BlockquoteElement,
    type: ELEMENT_BLOCKQUOTE,
    rootProps: {
      className: 'slate-blockquote',
      as: 'blockquote',
    },
  },
};
