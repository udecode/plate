import { DeserializeHtml } from 'slate-plugins';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = (): DeserializeHtml => ({
  element: {
    BLOCKQUOTE: () => ({ type: BLOCKQUOTE }),
  },
});
