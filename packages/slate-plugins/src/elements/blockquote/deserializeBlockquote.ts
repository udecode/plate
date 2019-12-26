import { DeserializeHtml } from 'paste-html/types';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = (): DeserializeHtml => ({
  element: {
    BLOCKQUOTE: () => ({ type: BLOCKQUOTE }),
  },
});
