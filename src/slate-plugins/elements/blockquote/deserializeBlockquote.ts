import { DeserializeHtml } from 'slate-plugins/paste-html/types';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = (): DeserializeHtml => ({
  element: {
    BLOCKQUOTE: () => ({ type: BLOCKQUOTE }),
  },
});
