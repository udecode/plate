import { DeserializeHtml } from 'deserializers/types';
import { BLOCKQUOTE } from './types';

export const deserializeBlockquote = ({
  typeBlockquote = BLOCKQUOTE,
} = {}): DeserializeHtml => ({
  element: {
    BLOCKQUOTE: () => ({ type: typeBlockquote }),
  },
});
