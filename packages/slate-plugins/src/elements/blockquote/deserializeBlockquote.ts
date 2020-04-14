import { DeserializeHtml } from 'deserializers/types';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = (): DeserializeHtml => ({
  element: {
    BLOCKQUOTE: () => ({ type: BLOCKQUOTE }),
  },
});
