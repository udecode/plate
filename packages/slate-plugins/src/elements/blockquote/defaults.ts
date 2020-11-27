import { StyledElement } from '../../components/StyledComponent';
import { ELEMENT_PARAGRAPH } from '../paragraph';
import { BlockquoteElement } from './components/BlockquoteElement';
import { BlockquoteKeyOption, BlockquotePluginOptionsValues } from './types';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

export const DEFAULTS_BLOCKQUOTE: Record<
  BlockquoteKeyOption,
  BlockquotePluginOptionsValues
> = {
  blockquote: {
    component: BlockquoteElement,
    type: ELEMENT_BLOCKQUOTE,
    hotkey: 'mod+shift+.',
    rootProps: {
      className: 'slate-blockquote',
      as: 'blockquote',
    },
  },
  p: {
    component: StyledElement,
    type: ELEMENT_PARAGRAPH,
    rootProps: {
      className: `slate-${ELEMENT_BLOCKQUOTE}-${ELEMENT_PARAGRAPH}`,
      as: 'div',
      styles: {
        root: {
          // Get rid of default style
          margin: '0',
        },
      },
    },
  },
};
