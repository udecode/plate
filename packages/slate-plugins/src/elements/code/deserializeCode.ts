import { DeserializeHtml } from 'deserializers/types';
import { CODE } from './types';

export const deserializeCode = (): DeserializeHtml => ({
  element: {
    PRE: () => ({ type: CODE }),
  },
});
