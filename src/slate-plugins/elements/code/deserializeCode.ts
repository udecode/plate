import { DeserializeHtml } from 'slate-plugins';
import { CODE } from './types';

export const deserializeCode = (): DeserializeHtml => ({
  element: {
    PRE: () => ({ type: CODE }),
  },
});
